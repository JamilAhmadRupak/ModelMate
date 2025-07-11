'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { validateEmail, validatePassword } from '@/lib/utils';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
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
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.minLength) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!passwordValidation.hasUppercase || !passwordValidation.hasLowercase || !passwordValidation.hasNumber) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      if (result.success) {
        toast.success('Registration successful! Please sign in.');
        router.push('/auth/login');
      } else {
        if (typeof result.error === 'object') {
          // Handle field-specific errors
          setErrors(result.error);
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          placeholder="Enter your first name"
          required
        />

        <Input
          label="Last Name"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          placeholder="Enter your last name"
          required
        />
      </div>

      <Input
        label="Username"
        name="username"
        type="text"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        placeholder="Choose a username"
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Enter your email address"
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Create a strong password"
        required
      />

      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
      >
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;