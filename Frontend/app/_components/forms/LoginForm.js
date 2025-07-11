'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import  {login}  from '@/lib/auth';
import { toast } from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  console.log('Form submitted!'); // Add this line
  
  if (!validateForm()) {
    console.log('Validation failed'); // Add this line
    return;
  }

    setLoading(true);

    try {
      console.log('Submitting login form with data:', formData);
      const result = await login(formData);
      console.log('Login result:', result);
      if (result.success) {
        toast.success('Login successful!');
        router.push('/');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      console.log('Form onSubmit triggered');
      handleSubmit(e);
    }} className="space-y-6">
      <Input
        label="Username"
        name="username"
        type="text"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        placeholder="Enter your username"
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Enter your password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;