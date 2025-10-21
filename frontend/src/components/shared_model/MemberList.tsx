import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { SharedModelMember, Role } from "../../types/sharedModel";
import { sharedModelService } from "../../services/sharedModelService";

interface Props {
  members: SharedModelMember[];
  groupId: number;
  isAdmin: boolean;
  onUpdate: () => void;
}

const MemberList: React.FC<Props> = ({
  members,
  groupId,
  isAdmin,
  onUpdate,
}) => {
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("contributor");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleInviteMember = async () => {
    try {
      // In a real app, you'd first search for the user by email
      const userId = 1; // Placeholder
      await sharedModelService.inviteMember(groupId, userId, inviteRole);
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("contributor");
      onUpdate();
    } catch (error) {
      console.error("Failed to invite member:", error);
    }
  };

  const handleRoleChange = async (memberId: number, newRole: Role) => {
    try {
      await sharedModelService.updateMemberRole(memberId, newRole);
      onUpdate();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const renderMobileView = () => (
    <Box>
      {members.map((member) => (
        <Card key={member.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1">{member.user.username}</Typography>
            <Typography variant="body2" color="text.secondary">
              {member.user.email}
            </Typography>
            <Box
              sx={{
                mt: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2">
                Contributions: {member.contribution_count}
              </Typography>
              {isAdmin && (
                <Select
                  value={member.role}
                  size="small"
                  onChange={(e) =>
                    handleRoleChange(member.id, e.target.value as Role)
                  }
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="contributor">Contributor</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Member</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Contributions</TableCell>
            <TableCell>Joined</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.user.username}</TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                {isAdmin ? (
                  <Select
                    value={member.role}
                    size="small"
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value as Role)
                    }
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="contributor">Contributor</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
                  </Select>
                ) : (
                  member.role
                )}
              </TableCell>
              <TableCell>{member.contribution_count}</TableCell>
              <TableCell>
                {new Date(member.joined_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">Members ({members.length})</Typography>
          {isAdmin && (
            <Button
              startIcon={<PersonAddIcon />}
              onClick={() => setInviteDialogOpen(true)}
            >
              Invite Member
            </Button>
          )}
        </Box>

        {isMobile ? renderMobileView() : renderDesktopView()}

        <Dialog
          open={isInviteDialogOpen}
          onClose={() => setInviteDialogOpen(false)}
        >
          <DialogTitle>Invite New Member</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="contributor">Contributor</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInviteMember} variant="contained">
              Send Invite
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MemberList;
