import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MoodCanvas from "./shared/MoodCanvas";
import GenreMixer from "./shared/GenreMixer";
import ChordProgressionEditor from "./shared/ChordProgressionEditor";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuth } from "../contexts/AuthContext";
import {
  MoodPoint,
  GenreWeight,
  Chord,
  TimelineState,
  CreativeRole,
} from "../types/collaborationTypes";
import { api } from "../services/api";

interface CollaborativeWorkspaceProps {
  sessionId: string;
}

const CollaborativeWorkspace: React.FC<CollaborativeWorkspaceProps> = ({
  sessionId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [timelineState, setTimelineState] = useState<TimelineState | null>(
    null,
  );
  const [userRole, setUserRole] = useState<CreativeRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // WebSocket connection
  const { sendMessage, lastMessage } = useWebSocket(
    `ws://localhost:8000/ws/shared-model/${sessionId}/`,
  );

  // Load initial data
  useEffect(() => {
    const loadWorkspaceData = async () => {
      try {
        const [timelineResponse, roleResponse] = await Promise.all([
          api.get(`/collaborative-sessions/${sessionId}/timeline-state`),
          api.get(`/creative-roles/${sessionId}`),
        ]);

        setTimelineState(timelineResponse.data);
        setUserRole(roleResponse.data);
      } catch (error) {
        console.error("Failed to load workspace data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaceData();
  }, [sessionId]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === "timeline_state") {
        setTimelineState(data);
      }
    }
  }, [lastMessage]);

  // Mood timeline handlers
  const handleMoodChange = useCallback(
    (intensity: number, timestamp: number, moodType: string) => {
      if (!userRole || userRole.role_type !== "mood_designer") return;

      const update = {
        type: "mood",
        timestamp,
        user: user.id,
        data: {
          mood_type: moodType,
          intensity,
          transition_type: "linear",
        },
      };

      sendMessage(JSON.stringify(update));
    },
    [userRole, user, sendMessage],
  );

  // Genre blend handlers
  const handleGenreChange = useCallback(
    (weights: GenreWeight[]) => {
      if (!userRole || userRole.role_type !== "genre_mixer") return;

      const update = {
        type: "genre",
        timestamp: timelineState?.timestamp || 0,
        user: user.id,
        data: {
          weights,
          duration: 4, // Default to 4 bars
        },
      };

      sendMessage(JSON.stringify(update));
    },
    [userRole, user, timelineState, sendMessage],
  );

  // Chord progression handlers
  const handleChordChange = useCallback(
    (progression: Chord[]) => {
      if (!userRole || userRole.role_type !== "chord_progressionist") return;

      const update = {
        type: "chord",
        timestamp: timelineState?.timestamp || 0,
        user: user.id,
        data: {
          chords: progression,
          duration: progression.reduce((sum, chord) => sum + chord.duration, 0),
        },
      };

      sendMessage(JSON.stringify(update));
    },
    [userRole, user, timelineState, sendMessage],
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Timeline Display */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Collaborative Timeline
            </Typography>
            <Box
              sx={{
                height: 200,
                position: "relative",
                backgroundColor: theme.palette.background.default,
                borderRadius: 1,
              }}
            >
              {/* Timeline visualization here */}
            </Box>
          </Paper>
        </Grid>

        {/* Role-specific Tools */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
            >
              <Tab label="Mood Design" />
              <Tab label="Genre Mix" />
              <Tab label="Chord Progression" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && (
                <Box>
                  <Grid container spacing={2}>
                    {[
                      "happy",
                      "sad",
                      "energetic",
                      "calm",
                      "tense",
                      "relaxed",
                    ].map((moodType) => (
                      <Grid item xs={12} sm={6} key={moodType}>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, textTransform: "capitalize" }}
                        >
                          {moodType}
                        </Typography>
                        <MoodCanvas
                          width={isMobile ? 300 : 400}
                          height={100}
                          moodType={moodType}
                          onIntensityChange={(intensity, timestamp) =>
                            handleMoodChange(intensity, timestamp, moodType)
                          }
                          existingPoints={
                            timelineState?.mood_intensities?.[moodType] || []
                          }
                          isActive={userRole?.role_type === "mood_designer"}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {activeTab === 1 && (
                <GenreMixer
                  genres={[
                    "rock",
                    "jazz",
                    "classical",
                    "electronic",
                    "folk",
                    "hip_hop",
                    "ambient",
                    "blues",
                    "latin",
                    "funk",
                  ]}
                  initialWeights={timelineState?.active_genres || []}
                  onChange={handleGenreChange}
                  disabled={userRole?.role_type !== "genre_mixer"}
                />
              )}

              {activeTab === 2 && (
                <ChordProgressionEditor
                  initialProgression={timelineState?.current_progression || []}
                  onChange={handleChordChange}
                  disabled={userRole?.role_type !== "chord_progressionist"}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Analysis and Suggestions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Analysis & Suggestions
            </Typography>

            {timelineState && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Current Mood</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Object.entries(timelineState.mood_intensities)
                      .map(
                        ([mood, intensity]) =>
                          `${mood}: ${Math.round(intensity * 100)}%`,
                      )
                      .join(", ")}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Active Genres</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Object.entries(timelineState.active_genres)
                      .map(
                        ([genre, weight]) =>
                          `${genre}: ${Math.round(weight * 100)}%`,
                      )
                      .join(", ")}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    Current Progression
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current: {timelineState.current_chord}
                    <br />
                    Next: {timelineState.next_chord}
                  </Typography>
                </Box>

                {timelineState.upcoming_transition && (
                  <Box>
                    <Typography variant="subtitle2">
                      Upcoming Transition
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {timelineState.upcoming_transition.type}
                      <br />
                      In:{" "}
                      {Math.round(
                        timelineState.upcoming_transition.start_time -
                          timelineState.timestamp,
                      )}{" "}
                      seconds
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CollaborativeWorkspace;
