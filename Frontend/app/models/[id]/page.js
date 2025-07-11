'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function PostReview() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    rating: 4,
  });

  useEffect(() => {
    api.get('/users/me/').then(({ data }) => setUser(data)).catch(() => {});
  }, []);

  if (!user)
    return (
      <div className="max-w-sm mx-auto mt-20 text-center">
        <p className="mb-4">You must log in first.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-brand text-white rounded"
        >
          Sign in
        </button>
      </div>
    );

  const submit = async (e) => {
    e.preventDefault();
    await api.post(`/models/${id}/reviews/`, form);
    router.push(`/models/${id}`);
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-lg mx-auto mt-10 space-y-4 bg-white p-6 rounded shadow"
    >
      <h1 className="text-2xl font-bold">Write a Review</h1>
      <input
        required
        className="w-full border p-2 rounded"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <textarea
        required
        className="w-full border p-2 rounded h-32"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <select
        value={form.rating}
        onChange={(e) => setForm({ ...form, rating: +e.target.value })}
        className="border p-2 rounded"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>
      <button className="w-full py-2 bg-brand text-white rounded">
        Submit
      </button>
    </form>
  );
}
