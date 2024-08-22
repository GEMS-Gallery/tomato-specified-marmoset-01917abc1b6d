import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Paper, List, ListItem, ListItemText, TextField, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { AuthClient } from '@dfinity/auth-client';
import { backend } from 'declarations/backend';

const ConsoleInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    color: '#00FF00',
    fontFamily: 'Courier, monospace',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#00FF00',
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
  '&:hover': {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
}));

interface Category {
  id: bigint;
  name: string;
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

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      setAuthClient(client);
    });
  }, []);

  const login = async () => {
    if (authClient) {
      await authClient.login({
        identityProvider: 'https://identity.ic0.app/#authorize',
        onSuccess: () => setIsAuthenticated(true),
      });
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
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
    </Router>
  );
};

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await backend.getCategories();
      setCategories(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Categories
      </Typography>
      <List>
        {categories.map((category) => (
          <ListItem key={Number(category.id)} component={Link} to={`/category/${category.id}`}>
            <ListItemText primary={category.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const TopicList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTopics(BigInt(id));
    }
  }, [id]);

  const fetchTopics = async (categoryId: bigint) => {
    try {
      const result = await backend.getTopics(categoryId);
      setTopics(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics:', error);
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
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Topics
      </Typography>
      <List>
        {topics.map((topic) => (
          <ListItem key={Number(topic.id)} component={Link} to={`/topic/${topic.id}`}>
            <ListItemText primary={topic.title} secondary={`by ${topic.author}`} />
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

  useEffect(() => {
    if (id) {
      fetchTopicAndReplies(BigInt(id));
    }
  }, [id]);

  const fetchTopicAndReplies = async (topicId: bigint) => {
    try {
      const topicResult = await backend.getTopics(topicId);
      if (topicResult.length > 0) {
        setTopic(topicResult[0]);
      }
      const repliesResult = await backend.getReplies(topicId);
      setReplies(repliesResult);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topic and replies:', error);
      setLoading(false);
    }
  };

  const createReply = async () => {
    if (id && newReplyContent) {
      try {
        await backend.createReply(BigInt(id), newReplyContent, null);
        setNewReplyContent('');
        fetchTopicAndReplies(BigInt(id));
      } catch (error) {
        console.error('Error creating reply:', error);
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      {topic && (
        <>
          <Typography variant="h4" gutterBottom>
            {topic.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {topic.content}
          </Typography>
          <Typography variant="caption">
            by {topic.author} on {new Date(Number(topic.createdAt) / 1000000).toLocaleString()}
          </Typography>
        </>
      )}
      <Typography variant="h5" sx={{ mt: 4 }}>
        Replies
      </Typography>
      {replies.map((reply) => (
        <Paper key={Number(reply.id)} sx={{ mt: 2, p: 2 }} className="nested-reply">
          <Typography variant="body1">{reply.content}</Typography>
          <Typography variant="caption">
            by {reply.author} on {new Date(Number(reply.createdAt) / 1000000).toLocaleString()}
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
