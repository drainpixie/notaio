import { debounce } from '$lib';
import equal from 'fast-deep-equal';
import type { Note } from '$lib/server/db/schema';

interface NotesState {
    notes: Note[];
    activeNote: Note;
    originalNotes: Note[];
    isLoading: boolean;
    error: string | null;
}

const initialState: NotesState = {
    notes: [],
    activeNote: null as unknown as Note,
    originalNotes: [],
    isLoading: false,
    error: null
};

function createNotesStore() {
    const state = $state<NotesState>(initialState);

    const save = debounce(async () => {
        const changed = state.notes.filter((note, i) => !equal(note, state.originalNotes[i]));

        if (changed.length === 0) return;

        try {
            const body = new FormData();
            body.append('notes', JSON.stringify(changed));

            const response = await fetch('/api/notes/save', {
                method: 'POST',
                body
            });

            if (!response.ok)
                throw new Error('Failed to save notes');

            state.originalNotes = [...state.notes];
            state.error = null;
        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to save notes';
        }
    }, 1000);

    return {
        get notes() {
            return state.notes;
        },

        get activeNote() {
            return state.activeNote;
        },

        get isLoading() {
            return state.isLoading;
        },

        get error() {
            return state.error;
        },

        initialize: (notes: Note[]) => {
            state.notes = [...notes];
            state.activeNote = notes[0] || null;
            state.originalNotes = [...notes];
            state.isLoading = false;
            state.error = null;
        },

        active: (note: Note) => {
            state.activeNote = note;
        },

        update: (noteId: string, updates: Partial<Note>) => {
            state.notes = state.notes.map(note =>
                note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note
            );

            if (state.activeNote?.id === noteId) {
                state.activeNote = { ...state.activeNote, ...updates, updatedAt: new Date() };
            }

            save();
        },

        add: async (noteData?: Partial<Note>) => {
            state.isLoading = true;

            try {
                const body = new FormData();
                if (noteData) {
                    Object.entries(noteData).forEach(([key, value]) => {
                        if (value !== undefined) {
                            body.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
                        }
                    });
                }

                const response = await fetch('/api/notes', {
                    method: 'POST',
                    body
                });

                if (!response.ok) {
                    throw new Error('Failed to create note');
                }

                const newNote: Note = await response.json();

                state.notes = [newNote, ...state.notes];
                state.activeNote = newNote;
                state.originalNotes = [newNote, ...state.originalNotes];
                state.isLoading = false;
                state.error = null;

                return newNote;
            } catch (error) {
                state.isLoading = false;
                state.error = error instanceof Error ? error.message : 'Failed to create note';
                throw error;
            }
        },

        delete: async (noteId: string) => {
            state.isLoading = true;

            try {
                const response = await fetch(`/api/notes/${noteId}`, {
                    method: 'DELETE'
                });

                if (!response.ok)
                    throw new Error('Failed to delete note');

                state.notes = state.notes.filter(note => note.id !== noteId);
                state.originalNotes = state.originalNotes.filter(note => note.id !== noteId);

                if (state.activeNote?.id === noteId) {
                    state.activeNote = state.notes[0] || null;
                }

                state.isLoading = false;
                state.error = null;
            } catch (error) {
                state.isLoading = false;
                state.error = error instanceof Error ? error.message : 'Failed to delete note';
                throw error;
            }
        },

        clearError: () => {
            state.error = null;
        },

        save: () => {
            save();
        }
    };
}

export const store = createNotesStore();
