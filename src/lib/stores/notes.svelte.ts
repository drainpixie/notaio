import { writable, derived, get } from 'svelte/store';
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
    const { subscribe, set, update } = writable<NotesState>(initialState);

    const debouncedSave = debounce(async () => {
        const state = get({ subscribe });
        const changed = state.notes.filter((note, i) => !equal(note, state.originalNotes[i]));

        if (changed.length === 0) return;

        try {
            const body = new FormData();
            body.append('notes', JSON.stringify(changed));

            const response = await fetch('?/save', {
                method: 'POST',
                body
            });

            if (!response.ok)
                throw new Error('Failed to save notes');

            update(state => ({
                ...state,
                originalNotes: [...state.notes],
                error: null
            }));
        } catch (error) {
            update(state => ({
                ...state,
                error: error instanceof Error ? error.message : 'Failed to save notes'
            }));
        }
    }, 1000);

    return {
        subscribe,

        initialize: (notes: Note[]) => {
            set({
                notes: [...notes],
                activeNote: notes[0],
                originalNotes: [...notes],
                isLoading: false,
                error: null
            });
        },

        active: (note: Note) => {
            update(state => ({
                ...state,
                activeNote: note
            }));
        },

        update: (noteId: string, updates: Partial<Note>) => {
            update(state => {
                const notes = state.notes.map(note =>
                    note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note
                );

                const activeNote = state.activeNote?.id === noteId
                    ? { ...state.activeNote, ...updates, updatedAt: new Date() }
                    : state.activeNote;

                return {
                    ...state,
                    notes,
                    activeNote
                };
            });

            debouncedSave();
        },

        add: async (noteData?: Partial<Note>) => {
            update(state => ({ ...state, isLoading: true }));

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

                update(state => ({
                    ...state,
                    notes: [newNote, ...state.notes],
                    activeNote: newNote,
                    originalNotes: [newNote, ...state.originalNotes],
                    isLoading: false,
                    error: null
                }));

                return newNote;
            } catch (error) {
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Failed to create note'
                }));
                throw error;
            }
        },

        delete: async (noteId: string) => {
            update(state => ({ ...state, isLoading: true }));

            try {
                const response = await fetch(`/api/notes/${noteId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete note');
                }

                update(state => {
                    const notes = state.notes.filter(note => note.id !== noteId);
                    const originalNotes = state.originalNotes.filter(note => note.id !== noteId);
                    const activeNote = state.activeNote?.id === noteId
                        ? (notes[0] || null)
                        : state.activeNote;

                    return {
                        ...state,
                        notes,
                        originalNotes,
                        activeNote,
                        isLoading: false,
                        error: null
                    };
                });
            } catch (error) {
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete note'
                }));
                throw error;
            }
        },

        clearError: () => {
            update(state => ({
                ...state,
                error: null
            }));
        },

        save: () => {
            debouncedSave();
        }
    };
}

export const notesStore = createNotesStore();

export const notes = derived(notesStore, $notesStore => $notesStore.notes);
export const activeNote = derived(notesStore, $notesStore => $notesStore.activeNote);
export const isLoading = derived(notesStore, $notesStore => $notesStore.isLoading);
export const error = derived(notesStore, $notesStore => $notesStore.error);