import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Settings, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  onNewEvent: () => void;
  onManageCategories: () => void;
}

export function MobileMenu({ onNewEvent, onManageCategories }: MobileMenuProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-4 gap-1 p-2">
        <Button
          variant="ghost"
          className="flex flex-col items-center justify-center p-3 text-primary h-auto"
        >
          <CalendarDays className="h-5 w-5" />
          <span className="text-xs mt-1">Calendar</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onNewEvent}
          className="flex flex-col items-center justify-center p-3 text-gray-500 hover:text-gray-700 h-auto"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs mt-1">Add Event</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onManageCategories}
          className="flex flex-col items-center justify-center p-3 text-gray-500 hover:text-gray-700 h-auto"
        >
          <Tags className="h-5 w-5" />
          <span className="text-xs mt-1">Categories</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center justify-center p-3 text-gray-500 hover:text-gray-700 h-auto"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </Button>
      </div>
    </div>
  );
}
