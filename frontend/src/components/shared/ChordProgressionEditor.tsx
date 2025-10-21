import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { Chord } from "../../types/chordTypes";

interface ChordProgressionEditorProps {
  initialProgression?: Chord[];
  onChange: (progression: Chord[]) => void;
  onPlay?: (progression: Chord[]) => void;
  onStop?: () => void;
  disabled?: boolean;
}

const ChordProgressionEditor: React.FC<ChordProgressionEditorProps> = ({
  initialProgression = [],
  onChange,
  onPlay,
  onStop,
  disabled = false,
}) => {
  const [progression, setProgression] = useState<Chord[]>(initialProgression);
  const [isPlaying, setIsPlaying] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const chordRoots = ["C", "D", "E", "F", "G", "A", "B"];
  const chordQualities = ["", "m", "7", "m7", "maj7", "dim", "aug"];

  useEffect(() => {
    if (initialProgression.length > 0) {
      setProgression(initialProgression);
    }
  }, [initialProgression]);

  const handleAddChord = () => {
    const newChord: Chord = {
      root: "C",
      quality: "",
      duration: 1,
    };
    const newProgression = [...progression, newChord];
    setProgression(newProgression);
    onChange(newProgression);
  };

  const handleRemoveChord = (index: number) => {
    const newProgression = progression.filter((_, i) => i !== index);
    setProgression(newProgression);
    onChange(newProgression);
  };

  const handleChordChange =
    (index: number, field: keyof Chord) =>
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const newProgression = progression.map((chord, i) =>
        i === index ? { ...chord, [field]: event.target.value } : chord,
      );
      setProgression(newProgression);
      onChange(newProgression);
    };

  const handlePlayStop = () => {
    if (isPlaying) {
      setIsPlaying(false);
      onStop?.();
    } else {
      setIsPlaying(true);
      onPlay?.(progression);
    }
  };

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
          Chord Progression
        </Typography>
        <Box>
          {(onPlay || onStop) && (
            <Tooltip title={isPlaying ? "Stop" : "Play"}>
              <IconButton
                onClick={handlePlayStop}
                color={isPlaying ? "secondary" : "primary"}
                sx={{ mr: 1 }}
              >
                {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Add Chord">
            <IconButton onClick={handleAddChord} size="small">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {progression.map((chord, index) => (
          <Grid item xs={12} key={index}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="body2" sx={{ minWidth: 24 }}>
                {index + 1}.
              </Typography>

              <FormControl size="small" sx={{ minWidth: isMobile ? 60 : 80 }}>
                <InputLabel>Root</InputLabel>
                <Select
                  value={chord.root}
                  label="Root"
                  onChange={handleChordChange(index, "root")}
                >
                  {chordRoots.map((root) => (
                    <MenuItem key={root} value={root}>
                      {root}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: isMobile ? 70 : 90 }}>
                <InputLabel>Quality</InputLabel>
                <Select
                  value={chord.quality}
                  label="Quality"
                  onChange={handleChordChange(index, "quality")}
                >
                  {chordQualities.map((quality) => (
                    <MenuItem key={quality} value={quality}>
                      {quality || "maj"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: isMobile ? 70 : 90 }}>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={chord.duration}
                  label="Duration"
                  onChange={handleChordChange(index, "duration")}
                >
                  {[0.5, 1, 2, 4].map((duration) => (
                    <MenuItem key={duration} value={duration}>
                      {duration} bar{duration !== 1 ? "s" : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconButton onClick={() => handleRemoveChord(index)} size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      {progression.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 2 }}
        >
          Click the + button to add chords
        </Typography>
      )}

      {progression.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Total Duration:{" "}
            {progression.reduce((sum, chord) => sum + chord.duration, 0)} bars
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ChordProgressionEditor;
