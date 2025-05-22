<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <h2 class="card-title mb-1">Update Patient Medical Record</h2>
      <p class="text-muted small mb-4">Click the tabs to view and edit patient medical details</p>
      
      <!-- Authentication Error -->
      <div v-if="authError" class="alert alert-warning mb-3">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ authError }}
        <div class="mt-2">
          <button @click="retryQuery" class="btn btn-sm btn-outline-primary">
            Try Again
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-else-if="queryLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Loading investigations...</p>
      </div>

      <form v-else @submit.prevent="saveRecord">
        <div v-if="error" class="alert alert-danger mb-3">{{ error }}</div>
        <div v-if="success" class="alert alert-success mb-3">{{ success }}</div>
        
        <div v-for="(category, index) in categories" :key="index" class="mb-4">
          <h5 class="text-primary mb-3">{{ category }}</h5>
          
          <div v-if="['CT Scan', 'MRI'].includes(category)" class="mb-3">
            <div class="form-group">
              <select v-model="selectedScans[category]" class="form-select">
                <option :value="null">Specify</option>
                <option v-for="option in scanOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
          </div>
          
          <div v-else class="row g-3">
            <div v-for="(test, testIndex) in tests[category]" :key="testIndex" class="col-md-3 col-sm-6">
              <div class="form-check">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :id="`test-${index}-${testIndex}`"
                  v-model="selectedTests[category][testIndex]"
                >
                <label class="form-check-label" :for="`test-${index}-${testIndex}`">
                  {{ test }}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-end mt-4">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading || authError"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Saving...' : 'Save and Send' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { gql } from '@apollo/client/core';
import { useQuery, useMutation } from '@vue/apollo-composable';

// GraphQL queries
const INVESTIGATIONS_QUERY = gql`
  query GetInvestigations {
    investigations {
      id
      title
      type {
        id
        title
      }
    }
  }
`;

const UPDATE_RECORD_MUTATION = gql`
  mutation UpdateMedicalRecord($input: MedicalRecordInput!) {
    updateMedicalRecord(input: $input) {
      id
      status
      investigations {
        id
        title
      }
    }
  }
`;

// Component state
const authError = ref(null);
const error = ref(null);
const success = ref(null);
const selectedTests = reactive({});
const selectedScans = reactive({
  'CT Scan': null,
  'MRI': null
});
const scanOptions = ['Option 1', 'Option 2', 'Option 3'];

// Props
const props = defineProps({
  categories: {
    type: Array,
    default: () => ['Blood Tests', 'Urine Tests', 'CT Scan', 'MRI']
  },
  tests: {
    type: Object,
    default: () => ({
      'Blood Tests': ['CBC', 'Glucose', 'Cholesterol'],
      'Urine Tests': ['Urinalysis', 'Microalbumin'],
      'CT Scan': [],
      'MRI': []
    })
  }
});

// Use query with error handling
const { 
  result, 
  loading: queryLoading, 
  error: queryError,
  refetch: refetchQuery
} = useQuery(INVESTIGATIONS_QUERY, null, {
  errorPolicy: 'all', // Don't throw errors, handle them gracefully
  notifyOnNetworkStatusChange: true
});

// Use mutation with error handling
const { 
  mutate: updateRecord, 
  loading: mutationLoading 
} = useMutation(UPDATE_RECORD_MUTATION, {
  errorPolicy: 'all'
});

// Initialize selected tests
onMounted(() => {
  props.categories.forEach(category => {
    if (!['CT Scan', 'MRI'].includes(category)) {
      selectedTests[category] = props.tests[category].map(() => false);
    }
  });
});

// Watch for query results
watch(result, (newValue) => {
  if (newValue) {
    console.log('Investigations loaded:', newValue.investigations);
    authError.value = null; // Clear auth error if query succeeds
  }
});

// Handle query errors
watch(queryError, (newError) => {
  if (newError) {
    handleAuthError(newError);
  }
});

const handleAuthError = (apolloError) => {
  console.error('GraphQL Error:', apolloError);
  
  // Check for authentication errors
  const isAuthError = 
    apolloError.message.toLowerCase().includes('unauthorized') ||
    apolloError.message.toLowerCase().includes('unauthenticated') ||
    apolloError.message.toLowerCase().includes('not authenticated') ||
    apolloError.graphQLErrors?.some(e => 
      e.extensions?.code === 'UNAUTHENTICATED' ||
      e.extensions?.code === 'UNAUTHORIZED' ||
      e.message.toLowerCase().includes('auth')
    ) ||
    apolloError.networkError?.statusCode === 401 ||
    apolloError.networkError?.statusCode === 403;

  if (isAuthError) {
    authError.value = 'You need to be logged in to access this feature. Please check your authentication.';
    // Clear any sensitive data
    Object.keys(selectedTests).forEach(key => {
      selectedTests[key] = selectedTests[key].map(() => false);
    });
    selectedScans['CT Scan'] = null;
    selectedScans['MRI'] = null;
  } else {
    // Handle other types of errors
    error.value = 'Failed to load data: ' + apolloError.message;
  }
};

const retryQuery = async () => {
  authError.value = null;
  error.value = null;
  
  try {
    await refetchQuery();
  } catch (err) {
    handleAuthError(err);
  }
};

const saveRecord = async () => {
  error.value = null;
  success.value = null;
  
  // Don't proceed if there's an auth error
  if (authError.value) {
    error.value = 'Please resolve authentication issues before saving.';
    return;
  }
  
  try {
    // Prepare the data for submission
    const selectedInvestigations = [];
    
    // Process checkbox selections
    props.categories.forEach(category => {
      if (!['CT Scan', 'MRI'].includes(category)) {
        props.tests[category].forEach((test, index) => {
          if (selectedTests[category][index]) {
            selectedInvestigations.push({
              category,
              test,
              selected: true
            });
          }
        });
      }
    });
    
    // Process scan selections
    if (selectedScans['CT Scan']) {
      selectedInvestigations.push({
        category: 'CT Scan',
        test: selectedScans['CT Scan'],
        selected: true
      });
    }
    
    if (selectedScans['MRI']) {
      selectedInvestigations.push({
        category: 'MRI',
        test: selectedScans['MRI'],
        selected: true
      });
    }
    
    // Execute mutation
    const { data, errors } = await updateRecord({
      input: {
        patientId: 'PATIENT_ID_HERE', // You'll need to get this from props or route
        investigations: selectedInvestigations
      }
    });
    
    if (errors && errors.length > 0) {
      // Handle GraphQL errors from mutation
      const authErrors = errors.filter(err => 
        err.extensions?.code === 'UNAUTHENTICATED' ||
        err.extensions?.code === 'UNAUTHORIZED'
      );
      
      if (authErrors.length > 0) {
        authError.value = 'Your session has expired. Please log in again.';
        return;
      }
      
      error.value = 'Failed to update record: ' + errors[0].message;
      return;
    }
    
    success.value = 'Record updated successfully!';
    console.log('Record updated:', data.updateMedicalRecord);
    
  } catch (err) {
    console.error('Update error:', err);
    handleAuthError(err);
  }
};

const loading = computed(() => queryLoading.value || mutationLoading.value);
</script>

<style scoped>
.form-check-label {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .col-sm-6 {
    margin-bottom: 0.5rem;
  }
}

.spinner-border {
  vertical-align: middle;
}

.alert {
  border-radius: 0.5rem;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffecb5;
  color: #664d03;
}
</style>