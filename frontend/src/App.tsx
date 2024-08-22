import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Paper, List, ListItem, ListItemText, TextField, Button } from '@mui/material';
import { styled } from '@mui/system';
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
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await backend.getCategories();
      setCategories(result);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hacker Forum
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<CategoryList categories={categories} />} />
          <Route path="/category/:id" element={<TopicList />} />
          <Route path="/topic/:id" element={<TopicDetail />} />
        </Routes>
      </Container>
    </Router>
  );
};

const CategoryList: React.FC<{ categories: Category[] }> = ({ categories }) => {
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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');

  // Implement fetching topics and creating new topics here

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
      <ConsoleButton variant="outlined" sx={{ mt: 2 }}>
        Create Topic
      </ConsoleButton>
    </Paper>
  );
};

const TopicDetail: React.FC = () => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReplyContent, setNewReplyContent] = useState('');

  // Implement fetching topic details, replies, and creating new replies here

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
      <ConsoleButton variant="outlined" sx={{ mt: 2 }}>
        Post Reply
      </ConsoleButton>
    </Paper>
  );
};

export default App;
