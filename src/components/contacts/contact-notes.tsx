"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  MessageSquare,
  Lock,
  Globe,
  MoreVertical,
  Edit,
  Trash2,
  Save,
  X,
  AtSign,
} from "lucide-react";
import toast from "react-hot-toast";

interface Note {
  id: string;
  content: string;
  isPrivate: boolean;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface ContactNotesProps {
  contactId: string;
  contactName?: string;
}

export function ContactNotes({ contactId, contactName }: ContactNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNotePrivate, setNewNotePrivate] = useState(false);
  const [editNoteContent, setEditNoteContent] = useState("");
  const [editNotePrivate, setEditNotePrivate] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contactId) {
      fetchNotes();
    }
  }, [contactId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notes?contactId=${contactId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      } else {
        toast.error("Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          content: newNoteContent.trim(),
          isPrivate: newNotePrivate,
        }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes((prev) => [newNote, ...prev]);
        setNewNoteContent("");
        setNewNotePrivate(false);
        setIsAddingNote(false);
        toast.success("Note added successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editNoteContent.trim(),
          isPrivate: editNotePrivate,
        }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes((prev) =>
          prev.map((note) => (note.id === noteId ? updatedNote : note))
        );
        setEditingNoteId(null);
        setEditNoteContent("");
        toast.success("Note updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update note");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/notes/${noteToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== noteToDelete));
        setDeleteDialogOpen(false);
        setNoteToDelete(null);
        toast.success("Note deleted successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditNoteContent(note.content);
    setEditNotePrivate(note.isPrivate);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteContent("");
    setEditNotePrivate(false);
  };

  const openDeleteDialog = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const highlightMentions = (content: string) => {
    return content.replace(
      /@(\w+)/g,
      '<span class="text-blue-400 font-medium">@$1</span>'
    );
  };

  if (loading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="py-6 text-center text-neutral-400">
          Loading notes...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg">Notes</CardTitle>
            <CardDescription>
              Team notes for {contactName || "this contact"}
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsAddingNote(true)}
            size="sm"
            className="bg-white text-black hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Add New Note Form */}
          {isAddingNote && (
            <div className="p-4 border border-neutral-700 rounded-lg bg-neutral-800/50">
              <div className="space-y-3">
                <Textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Add a note... (use @username to mention teammates)"
                  className="bg-black border-neutral-700 text-white focus:border-white min-h-[80px]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="private-note"
                      checked={newNotePrivate}
                      onCheckedChange={setNewNotePrivate}
                    />
                    <Label
                      htmlFor="private-note"
                      className="text-sm text-neutral-300"
                    >
                      Private note
                    </Label>
                    {newNotePrivate ? (
                      <Lock className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNoteContent("");
                        setNewNotePrivate(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-neutral-700 hover:bg-neutral-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNoteContent.trim() || submitting}
                      size="sm"
                      className="bg-white text-black hover:bg-neutral-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Note
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notes yet</p>
              <p className="text-sm mt-1">
                Add the first note to start collaborating with your team
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 border border-neutral-700 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors"
                >
                  {editingNoteId === note.id ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <Textarea
                        value={editNoteContent}
                        onChange={(e) => setEditNoteContent(e.target.value)}
                        className="bg-black border-neutral-700 text-white focus:border-white min-h-[80px]"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editNotePrivate}
                            onCheckedChange={setEditNotePrivate}
                          />
                          <Label className="text-sm text-neutral-300">
                            Private note
                          </Label>
                          {editNotePrivate ? (
                            <Lock className="h-4 w-4 text-neutral-400" />
                          ) : (
                            <Globe className="h-4 w-4 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            size="sm"
                            className="border-neutral-700 hover:bg-neutral-700"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleEditNote(note.id)}
                            disabled={!editNoteContent.trim() || submitting}
                            size="sm"
                            className="bg-white text-black hover:bg-neutral-200"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-sm font-medium">
                            {note.author.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {note.author.name}
                            </div>
                            <div className="text-xs text-neutral-400">
                              {formatDate(note.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {note.isPrivate ? (
                              <Badge
                                variant="outline"
                                className="text-xs bg-red-900/20 text-red-300 border-red-700"
                              >
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-900/20 text-green-300 border-green-700"
                              >
                                <Globe className="h-3 w-3 mr-1" />
                                Team
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-neutral-400 hover:text-white"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-neutral-900 border-neutral-800">
                            <DropdownMenuItem
                              onClick={() => startEditNote(note)}
                              className="text-neutral-300 hover:bg-neutral-800"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(note.id)}
                              className="text-red-400 hover:bg-neutral-800"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div
                        className="text-sm text-neutral-200 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: highlightMentions(note.content),
                        }}
                      />
                      {note.mentions.length > 0 && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AtSign className="h-4 w-4 text-neutral-400" />
                          <div className="flex space-x-1">
                            {note.mentions.map((mentionId, index) => (
                              <Badge
                                key={mentionId}
                                variant="outline"
                                className="text-xs bg-blue-900/20 text-blue-300 border-blue-700"
                              >
                                @user{index + 1}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Note</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete this note? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outline"
              className="border-neutral-700 hover:bg-neutral-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteNote}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? "Deleting..." : "Delete Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
