import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Paper, List, ListItem, ListItemText, TextField, Button, CircularProgress, Grid, Card, CardContent, Icon, Snackbar } from '@mui/material';
import { styled } from '@mui/system';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { backend } from 'declarations/backend';

const ConsoleInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    color: '#00FF00',
    fontFamily: '"Roboto Mono", "Courier New", monospace',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#00FF00',
      borderRadius: 0,
    },
    '&:hover fieldset': {
      borderColor: '#00FF00',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#00FF00',
    },
  },
}));

const ConsoleButton = styled(Button)(({ theme }) => ({
  color: '#00FF00',
  borderColor: '#00FF00',
  borderRadius: 0,
  '&:hover': {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
}));

interface Category {
  id: bigint;
  name: string;
  icon: string;
}

interface Topic {
  id: bigint;
  categoryId: bigint;
  title: string;
  content: string;
  author: string;
  createdAt: bigint;
}

interface Reply {
  id: bigint;
  topicId: bigint;
  content: string;
  author: string;
  parentId: bigint | null;
  createdAt: bigint;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      setAuthClient(client);
    }).catch(err => {
      console.error("Error creating AuthClient:", err);
      setError("Failed to initialize authentication. Please try again.");
    });
  }, []);

  const login = async () => {
    if (authClient) {
      try {
        await authClient.login({
          identityProvider: 'https://identity.ic0.app/#authorize',
          onSuccess: () => setIsAuthenticated(true),
        });
      } catch (err) {
        console.error("Login error:", err);
        setError("Login failed. Please try again.");
      }
    }
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
    }
  };

  return (
    <Router>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: '"Roboto Mono", "Courier New", monospace' }}>
            Hacker Forum
          </Typography>
          {isAuthenticated ? (
            <ConsoleButton onClick={logout}>Logout</ConsoleButton>
          ) : (
            <ConsoleButton onClick={login}>Login</ConsoleButton>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<CategoryList />} />
          <Route path="/category/:id" element={<TopicList />} />
          <Route path="/topic/:id" element={<TopicDetail />} />
        </Routes>
      </Container>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
    </Router>
  );
};

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await backend.getCategories();
      console.log("Fetched categories:", result);
      setCategories(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {categories.map((category) => (
        <Grid item xs={12} sm={6} md={4} key={Number(category.id)}>
          <Card component={Link} to={`/category/${category.id}`} sx={{ textDecoration: 'none', height: '100%' }}>
            <CardContent>
              <Icon sx={{ fontSize: 40, mb: 2 }}>{category.icon}</Icon>
              <Typography variant="h5" component="div">
                {category.name}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const TopicList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTopics(BigInt(id));
    }
  }, [id]);

  const fetchTopics = async (categoryId: bigint) => {
    try {
      const result = await backend.getTopics(categoryId);
      console.log("Fetched topics:", result);
      setTopics(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to fetch topics. Please try again.');
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (id && newTopicTitle && newTopicContent) {
      try {
        await backend.createTopic(BigInt(id), newTopicTitle, newTopicContent);
        setNewTopicTitle('');
        setNewTopicContent('');
        fetchTopics(BigInt(id));
      } catch (error) {
        console.error('Error creating topic:', error);
        setError('Failed to create topic. Please try again.');
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Topics
      </Typography>
      <List>
        {topics.map((topic) => (
          <ListItem key={Number(topic.id)} component={Link} to={`/topic/${topic.id}`}>
            <ListItemText 
              primary={topic.title} 
              secondary={`by ${topic.author} on ${new Date(Number(topic.createdAt) / 1000000).toLocaleString()}`} 
            />
          </ListItem>
        ))}
      </List>
      <ConsoleInput
        fullWidth
        variant="outlined"
        placeholder="New topic title"
        value={newTopicTitle}
        onChange={(e) => setNewTopicTitle(e.target.value)}
        sx={{ mt: 2 }}
      />
      <ConsoleInput
        fullWidth
        variant="outlined"
        placeholder="New topic content"
        multiline
        rows={4}
        value={newTopicContent}
        onChange={(e) => setNewTopicContent(e.target.value)}
        sx={{ mt: 2 }}
      />
      <ConsoleButton variant="outlined" sx={{ mt: 2 }} onClick={createTopic}>
        Create Topic
      </ConsoleButton>
    </Paper>
  );
};

const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTopicAndReplies(BigInt(id));
    }
  }, [id]);

  const fetchTopicAndReplies = async (topicId: bigint) => {
    try {
      const topicResult = await backend.getTopic(topicId);
      console.log("Fetched topic:", topicResult);
      if (topicResult) {
        setTopic(topicResult);
      }
      const repliesResult = await backend.getReplies(topicId);
      console.log("Fetched replies:", repliesResult);
      setReplies(repliesResult);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topic and replies:', error);
      setError('Failed to fetch topic and replies. Please try again.');
      setLoading(false);
    }
  };

  const createReply = async () => {
    if (id && newReplyContent) {
      try {
        await backend.createReply(BigInt(id), newReplyContent, []);
        setNewReplyContent('');
        fetchTopicAndReplies(BigInt(id));
      } catch (error) {
        console.error('Error creating reply:', error);
        setError('Failed to create reply. Please try again.');
      }
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!topic) {
    return <Typography>Topic not found</Typography>;
  }

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {topic.title}
      </Typography>
      <Typography variant="body1" paragraph>
        {topic.content}
      </Typography>
      <Typography variant="caption">
        by {topic.author} on {formatDate(topic.createdAt)}
      </Typography>
      <Typography variant="h5" sx={{ mt: 4 }}>
        Replies
      </Typography>
      {replies.map((reply) => (
        <Paper key={Number(reply.id)} sx={{ mt: 2, p: 2 }} className="nested-reply">
          <Typography variant="body1">{reply.content}</Typography>
          <Typography variant="caption">
            by {reply.author} on {formatDate(reply.createdAt)}
          </Typography>
        </Paper>
      ))}
      <ConsoleInput
        fullWidth
        variant="outlined"
        placeholder="Your reply"
        multiline
        rows={4}
        value={newReplyContent}
        onChange={(e) => setNewReplyContent(e.target.value)}
        sx={{ mt: 2 }}
      />
      <ConsoleButton variant="outlined" sx={{ mt: 2 }} onClick={createReply}>
        Post Reply
      </ConsoleButton>
    </Paper>
  );
};

export default App;
