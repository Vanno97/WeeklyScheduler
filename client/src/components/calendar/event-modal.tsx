import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { insertAppointmentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { format, addDays } from "date-fns";
import { getWeekStart } from "@/lib/calendar-utils";
import type { Category, Appointment } from "@shared/schema";
import { z } from "zod";

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedSlot: { day: number; hour: number } | null;
  currentDate: Date;
  editingEvent?: Appointment | null;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  categoryId: z.number().optional(),
  email: z.string().email().optional().or(z.literal("")),
}).transform((data) => ({
  ...data,
  startTime: new Date(data.startTime).toISOString(),
  endTime: new Date(data.endTime).toISOString(),
  email: data.email || undefined,
}));

export function EventModal({ 
  open, 
  onOpenChange, 
  categories, 
  selectedSlot, 
  currentDate, 
  editingEvent 
}: EventModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      categoryId: undefined,
      email: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (editingEvent) {
        // Edit mode
        const startTime = new Date(editingEvent.startTime);
        const endTime = new Date(editingEvent.endTime);

        form.reset({
          title: editingEvent.title,
          description: editingEvent.description || "",
          startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
          categoryId: editingEvent.categoryId || undefined,
          email: editingEvent.email || "",
        });
      } else if (selectedSlot) {
        // New event with selected slot
        const weekStart = getWeekStart(currentDate);
        const slotDate = addDays(weekStart, selectedSlot.day);
        const startTime = new Date(slotDate);
        startTime.setHours(selectedSlot.hour, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(selectedSlot.hour + 1, 0, 0, 0);

        form.reset({
          title: "",
          description: "",
          startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
          categoryId: undefined,
          email: "",
        });
      } else {
        // New event without slot
        form.reset({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          categoryId: undefined,
          email: "",
        });
      }
    }
  }, [open, editingEvent, selectedSlot, currentDate, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.refetchQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Event created",
        description: "Your event has been successfully created.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      let errorMessage = "Failed to create event";
      if (error.message.includes("409")) {
        errorMessage = "This event conflicts with an existing appointment";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("PUT", `/api/appointments/${editingEvent?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.refetchQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Event updated",
        description: "Your event has been successfully updated.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update event";
      if (error.message.includes("409")) {
        errorMessage = "This event conflicts with an existing appointment";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/appointments/${editingEvent?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.refetchQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (editingEvent) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (editingEvent && window.confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? "Edit Event" : "Add New Event"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter event title"
              className="mt-1"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter event description"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...form.register("startTime")}
                className="mt-1"
              />
              {form.formState.errors.startTime && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.startTime.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...form.register("endTime")}
                className="mt-1"
              />
              {form.formState.errors.endTime && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select
              value={form.watch("categoryId")?.toString() || ""}
              onValueChange={(value) => form.setValue("categoryId", value ? parseInt(value) : undefined)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="email">Email for Notifications</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="your@email.com"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {editingEvent && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {isSubmitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}