<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <h2 class="card-title mb-4">Login</h2>
      
      <form @submit.prevent="handleLogin">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input 
            type="email" 
            class="form-control" 
            id="email" 
            v-model="email"
            required
            placeholder="Enter your email"
          >
        </div>
        
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input 
            type="password" 
            class="form-control" 
            id="password" 
            v-model="password"
            required
            placeholder="Enter your password"
          >
        </div>
        
        <div class="d-grid gap-2">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { gql } from '@apollo/client/core';
import { useMutation } from '@vue/apollo-composable';
import { useRouter } from 'vue-router'
const { onLogin } = useApollo()
const router = useRouter();

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) 
  }
`;

const { mutate: login, loading } = useMutation(LOGIN_MUTATION);
const email = ref('tester@kompletecare.com');
const password = ref('password');
const error = ref(null);

const handleLogin = async () => {
  error.value = null;
  
  try {
    const { data } = await login({
      email: email.value,
      password: password.value
    });
    
    // Handle successful login
    console.log('Login successful', data.login);
    
    localStorage.setItem('authToken', data.login);
    onLogin(data.login);

    router.push('/');
    
  } catch (err) {
    error.value = err.message || 'Login failed. Please try again.';
    console.error('Login error:', err);
  }
};
</script>

<style scoped>
.card {
  max-width: 400px;
  margin: 0 auto;
}

.spinner-border {
  vertical-align: middle;
}
</style>