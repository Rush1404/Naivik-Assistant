import { useState, useEffect } from 'react';

export const useProjectData = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjectState = async () => {
    try {
      // Endpoint mapping to your WP Logic Controller
      const response = await fetch('https://your-wp-site.com/wp-json/naivik/v1/project-state');
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectState();
    const interval = setInterval(fetchProjectState, 5000); // Polling for 'Proactive Checks'
    return () => clearInterval(interval);
  }, []);

  return { tasks, loading, refetch: fetchProjectState };
};