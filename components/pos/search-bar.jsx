import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Search menu items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 h-10"
      />
    </div>
  );
}
