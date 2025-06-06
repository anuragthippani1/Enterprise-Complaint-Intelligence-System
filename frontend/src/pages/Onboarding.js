import React from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SendIcon from "@mui/icons-material/Send";

const Onboarding = () => (
  <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Guide: Submitting a Complaint
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Follow these steps to log in and submit a complaint as a regular user:
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <LoginIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="1. Log In"
            secondary={
              <>
                Go to the <b>Login</b> page.
                <br />
                Enter your <b>username</b> and <b>password</b>.<br />
                Click <b>Login</b> to access your account.
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <AssignmentIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="2. Navigate to Complaints"
            secondary={
              <>
                After logging in, use the navigation menu to go to the{" "}
                <b>Complaints</b> page.
                <br />
                Here you can view your submitted complaints.
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <EditNoteIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="3. Submit a New Complaint"
            secondary={
              <>
                Click the <b>New Complaint</b> button.
                <br />
                Fill out the complaint form with the required details:
                <br />
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>
                    <b>Title</b>: Brief summary of your issue
                  </li>
                  <li>
                    <b>Description</b>: Detailed explanation
                  </li>
                  <li>
                    <b>Category</b>: Select the relevant category
                  </li>
                </ul>
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SendIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="4. Submit the Form"
            secondary={
              <>
                After filling out the form, click <b>Submit</b>.<br />
                You will see a confirmation message if your complaint is
                submitted successfully.
                <br />
                Your complaint will now appear in your list.
              </>
            }
          />
        </ListItem>
      </List>
      <Box mt={3}>
        <Typography variant="body2" color="text.secondary">
          Need help? Contact support or ask your admin for assistance.
        </Typography>
      </Box>
    </Paper>
  </Container>
);

export default Onboarding;
