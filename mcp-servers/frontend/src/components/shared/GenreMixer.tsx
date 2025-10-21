import React, { useState, useEffect } from "react";
import {
  Box,
  Slider,
  Typography,
  Paper,
  Grid,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { GenreWeight } from "../../types/genreTypes";

interface GenreMixerProps {
  genres: string[];
  initialWeights?: GenreWeight[];
  onChange: (weights: GenreWeight[]) => void;
  disabled?: boolean;
}

const GenreMixer: React.FC<GenreMixerProps> = ({
  genres,
  initialWeights = [],
  onChange,
  disabled = false,
}) => {
  const [weights, setWeights] = useState<GenreWeight[]>(initialWeights);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const genreColors = {
    rock: "#E74C3C",
    jazz: "#3498DB",
    classical: "#9B59B6",
    electronic: "#2ECC71",
    folk: "#F1C40F",
    hip_hop: "#E67E22",
    ambient: "#1ABC9C",
    blues: "#34495E",
    latin: "#E91E63",
    funk: "#FF5722",
  };

  useEffect(() => {
    if (initialWeights.length > 0) {
      setWeights(initialWeights);
    }
  }, [initialWeights]);

  const handleWeightChange =
    (genre: string) => (event: Event, value: number | number[]) => {
      const newValue = Array.isArray(value) ? value[0] : value;
      const newWeights = weights.map((w) =>
        w.genre === genre ? { ...w, weight: newValue } : w,
      );
      setWeights(newWeights);
      onChange(newWeights);
    };

  const addGenre = () => {
    const unusedGenres = genres.filter(
      (g) => !weights.find((w) => w.genre === g),
    );
    if (unusedGenres.length > 0) {
      const newWeight = { genre: unusedGenres[0], weight: 0.5 };
      const newWeights = [...weights, newWeight];
      setWeights(newWeights);
      onChange(newWeights);
    }
  };

  const removeGenre = (genre: string) => {
    const newWeights = weights.filter((w) => w.genre !== genre);
    setWeights(newWeights);
    onChange(newWeights);
  };

  const normalizeWeights = () => {
    const total = weights.reduce((sum, w) => sum + w.weight, 0);
    if (total > 0) {
      const normalized = weights.map((w) => ({
        ...w,
        weight: w.weight / total,
      }));
      setWeights(normalized);
      onChange(normalized);
    }
  };

  useEffect(() => {
    if (weights.length > 0) {
      normalizeWeights();
    }
  }, [weights.length]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        opacity: disabled ? 0.7 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="h2">
          Genre Mix
        </Typography>
        <Tooltip title="Add Genre">
          <IconButton
            onClick={addGenre}
            disabled={weights.length >= genres.length}
            size="small"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        {weights.map(({ genre, weight }) => (
          <Grid item xs={12} key={genre}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor:
                    genreColors[genre as keyof typeof genreColors] ||
                    theme.palette.primary.main,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  minWidth: isMobile ? 60 : 80,
                  textTransform: "capitalize",
                }}
              >
                {genre.replace("_", " ")}
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <Slider
                  value={weight}
                  onChange={handleWeightChange(genre)}
                  min={0}
                  max={1}
                  step={0.01}
                  sx={{
                    "& .MuiSlider-thumb": {
                      backgroundColor:
                        genreColors[genre as keyof typeof genreColors] ||
                        theme.palette.primary.main,
                    },
                    "& .MuiSlider-track": {
                      backgroundColor:
                        genreColors[genre as keyof typeof genreColors] ||
                        theme.palette.primary.main,
                    },
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{ minWidth: 40, textAlign: "right" }}
              >
                {Math.round(weight * 100)}%
              </Typography>
              <IconButton
                onClick={() => removeGenre(genre)}
                size="small"
                sx={{ ml: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      {weights.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 2 }}
        >
          Click the + button to add genres
        </Typography>
      )}
    </Paper>
  );
};

export default GenreMixer;
