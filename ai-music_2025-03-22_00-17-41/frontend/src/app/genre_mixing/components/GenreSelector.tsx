import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Genre, MixingSessionGenre } from "@/types/GenreMixing";

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenres: MixingSessionGenre[];
  onGenreSelect: (genre: Genre) => void;
  isLoading?: boolean;
}

export function GenreSelector({
  genres,
  selectedGenres,
  onGenreSelect,
  isLoading = false,
}: GenreSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isGenreSelected = (genreId: string) =>
    selectedGenres.some((sg) => sg.genre.id === genreId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select Genres</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search genres..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {filteredGenres.map((genre) => (
              <Button
                key={genre.id}
                variant={isGenreSelected(genre.id) ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={() => onGenreSelect(genre)}
                disabled={isLoading}
              >
                {genre.name}
                {genre.description && (
                  <Badge variant="outline" className="ml-2">
                    {genre.description}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
