<template>
  <div class="investigations-container">
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

    <!-- Main Form -->
    <form v-else @submit.prevent="saveRecord">
      <div v-if="error" class="alert alert-danger mb-3">{{ error }}</div>
      <div v-if="success" class="alert alert-success mb-3">{{ success }}</div>

      <div v-if="showDataStatus" class="alert alert-info mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <span>
            <strong>Data Status:</strong>
            Showing {{ totalInvestigationsCount }} investigations ({{
              apiInvestigationsCount
            }}
            from API{{
              fallbackCount > 0
                ? `, ${fallbackCount} from design fallback`
                : ""
            }})
          </span>
          <button
            @click="showDataStatus = false"
            class="btn-close btn-sm"
            type="button"
          ></button>
        </div>
      </div>

      <!-- X-Ray Section -->
      <div class="investigation-section">
        <h3 class="section-text">X-Ray</h3>
        <div class="investigation-grid">
          <div
            v-for="investigation in xrayInvestigations"
            :key="investigation.id"
            class="investigation-item"
          >
            <label class="investigation-checkbox">
              <input
                type="checkbox"
                :value="investigation.id"
                v-model="selectedInvestigations"
              />
              <span class="checkmark"></span>
              {{ investigation.title }}
              <span
                v-if="investigation.isFromAPI === false"
                class="fallback-indicator"
                title="From design fallback"
                >*</span
              >
            </label>
          </div>
        </div>
      </div>

      <!-- Ultrasound Scan Section -->
      <div class="investigation-section">
        <h3 class="section-title">Ultrasound Scan</h3>
        <div class="investigation-grid">
          <div
            v-for="investigation in ultrasoundInvestigations"
            :key="investigation.id"
            class="investigation-item"
          >
            <label class="investigation-checkbox">
              <input
                type="checkbox"
                :value="investigation.id"
                v-model="selectedInvestigations"
              />
              <span class="checkmark"></span>
              {{ investigation.title }}
              <span
                v-if="investigation.isFromAPI === false"
                class="fallback-indicator"
                title="From design fallback"
                >*</span
              >
            </label>
          </div>
        </div>
      </div>

      <!-- CT Scan & MRI Section -->
      <div class="investigation-section section-title">
        <div class="dropdown-section">
          <h3 class="section-text">CT Scan</h3>
          <select v-model="selectedCTScan" class="investigation-dropdown">
            <option value="">Specify</option>
            <option
              v-for="investigation in ctScanInvestigations"
              :key="investigation.id"
              :value="investigation.id"
            >
              {{ investigation.title }}
              <span v-if="investigation.isFromAPI === false">*</span>
            </option>
          </select>
        </div>

        <div class="dropdown-section">
          <h3 class="section-text">MRI</h3>
          <select v-model="selectedMRI" class="investigation-dropdown">
            <option value="">Specify</option>
            <option
              v-for="investigation in mriInvestigations"
              :key="investigation.id"
              :value="investigation.id"
            >
              {{ investigation.title }}
              <span v-if="investigation.isFromAPI === false">*</span>
            </option>
          </select>
        </div>
      </div>

      <!-- Fallback Notice -->
      <div v-if="fallbackCount > 0" class="alert alert-light mb-3">
        <small class="text-muted">
          <strong>Note:</strong> Items marked with * are from design
          specifications and will be available when backend data is complete.
          Only API data will be submitted.
        </small>
      </div>

      <div class="text-end mt-4">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || authError"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          {{ loading ? "Saving..." : "Save and Send" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import { gql } from "@apollo/client/core";
import { useQuery, useMutation } from "@vue/apollo-composable";

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

const designFallbackData = {
  "X-Ray": [
    "Chest",
    "Cervical Vertebrae",
    "Thoracic Vertebrae",
    "Lumvar Vertebrae",
    "Lumbo Sacral Vertebrae",
    "Thoraco Lumbar Vertebrae",
    "Wrist Joint",
    "Thoracic Inlet",
    "Shoulder Joint",
    "Elbow Joint",
    "Knee Joint",
    "Sacro Iliac Joint",
    "Pelvic Joint",
    "Hip Joint",
    "Femoral",
    "Ankle",
    "Humerus",
    "Radius/Ulner",
    "Foot",
    "Tibia/Fibula",
    "Fingers",
    "Toes",
  ],
  "Ultrasound Scan": [
    "Obstetric",
    "Abdominal",
    "Pelvis",
    "Prostate",
    "Breast",
    "Thyroid",
  ],
  "CT Scan": ["Head CT", "Chest CT", "Abdominal CT", "Pelvic CT"],
  MRI: ["Brain MRI", "Spine MRI", "Joint MRI", "Abdominal MRI"],
};

const authError = ref(null);
const error = ref(null);
const success = ref(null);
const selectedInvestigations = ref([]);
const selectedCTScan = ref("");
const selectedMRI = ref("");
const showDataStatus = ref(true);

const {
  result,
  loading: queryLoading,
  error: queryError,
  refetch: refetchQuery,
} = useQuery(INVESTIGATIONS_QUERY, null, {
  errorPolicy: "all",
  notifyOnNetworkStatusChange: true,
});

const { mutate: updateRecord, loading: mutationLoading } = useMutation(
  UPDATE_RECORD_MUTATION,
  {
    errorPolicy: "all",
  }
);

const createFallbackInvestigation = (title, type, index) => ({
  id: `fallback_${type.toLowerCase().replace(/\s+/g, "_")}_${index}`,
  title,
  type: {
    id: `fallback_type_${type.toLowerCase().replace(/\s+/g, "_")}`,
    title: type,
  },
  isFromAPI: false,
});

const mergeInvestigations = (apiInvestigations, type) => {
  const merged = [];
  const apiTitles = new Set();

  if (apiInvestigations) {
    apiInvestigations.forEach((inv) => {
      merged.push({ ...inv, isFromAPI: true });
      apiTitles.add(inv.title);
    });
  }

  if (designFallbackData[type]) {
    designFallbackData[type].forEach((title, index) => {
      const normalizedTitle =
        title === "Lumvar Vertebrae" ? "Lumbar Vartebrae" : title;

      if (!apiTitles.has(title) && !apiTitles.has(normalizedTitle)) {
        merged.push(createFallbackInvestigation(title, type, index));
      }
    });
  }

  return merged;
};

const xrayInvestigations = computed(() => {
  const apiXrays =
    result.value?.investigations?.filter((inv) => inv.type.title === "X-Ray") ||
    [];
  return mergeInvestigations(apiXrays, "X-Ray");
});

const ultrasoundInvestigations = computed(() => {
  const apiUltrasounds =
    result.value?.investigations?.filter(
      (inv) => inv.type.title === "Ultrasound Scan"
    ) || [];
  return mergeInvestigations(apiUltrasounds, "Ultrasound Scan");
});

const ctScanInvestigations = computed(() => {
  const apiCTScans =
    result.value?.investigations?.filter(
      (inv) => inv.type.title === "CT Scan"
    ) || [];
  return mergeInvestigations(apiCTScans, "CT Scan");
});

const mriInvestigations = computed(() => {
  const apiMRIs =
    result.value?.investigations?.filter((inv) => inv.type.title === "MRI") ||
    [];
  return mergeInvestigations(apiMRIs, "MRI");
});

const apiInvestigationsCount = computed(() => {
  return result.value?.investigations?.length || 0;
});

const fallbackCount = computed(() => {
  const allInvestigations = [
    ...xrayInvestigations.value,
    ...ultrasoundInvestigations.value,
    ...ctScanInvestigations.value,
    ...mriInvestigations.value,
  ];
  return allInvestigations.filter((inv) => !inv.isFromAPI).length;
});

const totalInvestigationsCount = computed(() => {
  return apiInvestigationsCount.value + fallbackCount.value;
});

watch(result, (newValue) => {
  if (newValue?.investigations) {
    console.log("API Investigations loaded:", newValue.investigations);
    console.log("Total X-Ray (with fallback):", xrayInvestigations.value);
    console.log(
      "Total Ultrasound (with fallback):",
      ultrasoundInvestigations.value
    );
    console.log(
      `Data Status: ${apiInvestigationsCount.value} from API, ${fallbackCount.value} from fallback`
    );
    authError.value = null;
  }
});

watch(queryError, (newError) => {
  if (newError) {
    handleAuthError(newError);
  }
});

const handleAuthError = (apolloError) => {
  console.error("GraphQL Error:", apolloError);

  const isAuthError =
    apolloError.message.toLowerCase().includes("unauthorized") ||
    apolloError.message.toLowerCase().includes("unauthenticated") ||
    apolloError.message.toLowerCase().includes("not authenticated") ||
    apolloError.graphQLErrors?.some(
      (e) =>
        e.extensions?.code === "UNAUTHENTICATED" ||
        e.extensions?.code === "UNAUTHORIZED" ||
        e.message.toLowerCase().includes("auth")
    ) ||
    apolloError.networkError?.statusCode === 401 ||
    apolloError.networkError?.statusCode === 403;

  if (isAuthError) {
    authError.value =
      "You need to be logged in to access this feature. Please check your authentication.";
    selectedInvestigations.value = [];
    selectedCTScan.value = "";
    selectedMRI.value = "";
  } else {
    error.value = "Failed to load data: " + apolloError.message;
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

  if (authError.value) {
    error.value = "Please resolve authentication issues before saving.";
    return;
  }

  try {
    const apiOnlySelections = selectedInvestigations.value.filter(
      (id) => !id.toString().startsWith("fallback_")
    );

    const allSelectedIds = [...apiOnlySelections];

    if (
      selectedCTScan.value &&
      !selectedCTScan.value.toString().startsWith("fallback_")
    ) {
      allSelectedIds.push(selectedCTScan.value);
    }

    if (
      selectedMRI.value &&
      !selectedMRI.value.toString().startsWith("fallback_")
    ) {
      allSelectedIds.push(selectedMRI.value);
    }

    const fallbackSelections = [
      ...selectedInvestigations.value.filter((id) =>
        id.toString().startsWith("fallback_")
      ),
      ...(selectedCTScan.value?.toString().startsWith("fallback_")
        ? [selectedCTScan.value]
        : []),
      ...(selectedMRI.value?.toString().startsWith("fallback_")
        ? [selectedMRI.value]
        : []),
    ];

    if (fallbackSelections.length > 0) {
      console.warn(
        `${fallbackSelections.length} fallback items selected but not submitted:`,
        fallbackSelections
      );
    }

    const { data, errors } = await updateRecord({
      input: {
        patientId: "PATIENT_ID_HERE",
        investigationIds: allSelectedIds,
      },
    });

    if (errors && errors.length > 0) {
      const authErrors = errors.filter(
        (err) =>
          err.extensions?.code === "UNAUTHENTICATED" ||
          err.extensions?.code === "UNAUTHORIZED"
      );

      if (authErrors.length > 0) {
        authError.value = "Your session has expired. Please log in again.";
        return;
      }

      error.value = "Failed to update record: " + errors[0].message;
      return;
    }

    const submittedCount = allSelectedIds.length;
    const fallbackSkipped = fallbackSelections.length;

    success.value =
      `Record updated successfully! Submitted ${submittedCount} investigations.` +
      (fallbackSkipped > 0
        ? ` (${fallbackSkipped} design items skipped - not yet available in API)`
        : "");

    console.log("Record updated:", data.updateMedicalRecord);
    console.log("Submitted investigations:", allSelectedIds);
  } catch (err) {
    console.error("Update error:", err);
    handleAuthError(err);
  }
};

const loading = computed(() => queryLoading.value || mutationLoading.value);
</script>

<style scoped>
.investigations-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
}

.investigation-section {
  margin-bottom: 25px;
}

.section-text {
  font-size: 18px;
  font-weight: 600;
  color: #382f90;
  margin-bottom: 6px;
  padding-top: 10px;
  padding-bottom: 8px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #382f90;
  margin-bottom: 6px;
  padding-top: 30px;
  padding-bottom: 8px;
  border-top: 2px solid #e5e7eb;
}

.investigation-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 20px;
  align-items: start;
}

.investigation-item {
  display: flex;
  align-items: flex-start;
}

.investigation-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.4;
  color: #374151;
  gap: 8px;
  margin: 0;
  padding: 4px 0;
  width: 100%;
}

.investigation-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  accent-color: #382f90;
}

.investigation-checkbox:hover {
  color: #382f90;
}

.fallback-indicator {
  color: #6b7280;
  font-weight: bold;
  margin-left: 4px;
}

.dropdown-section {
  display: inline-block;
  margin-right: 40px;
  margin-bottom: 20px;
  min-width: 200px;
}

.investigation-dropdown {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  cursor: pointer;
}

.investigation-dropdown:focus {
  outline: none;
  border-color: #382f90;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #382f90;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5856eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:before {
  content: "×";
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.alert-info {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.alert-light {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.alert-warning {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.alert-danger {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.alert-success {
  background-color: #d1fae5;
  color: #059669;
  border: 1px solid #6ee7b7;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

.text-center {
  text-align: center;
}

.text-end {
  text-align: right;
}

.text-muted {
  color: #6b7280;
}

/* Responsive design */
@media (max-width: 1024px) {
  .investigation-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .investigation-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 16px;
  }

  .dropdown-section {
    display: block;
    margin-right: 0;
    margin-bottom: 16px;
  }
}

@media (max-width: 480px) {
  .investigation-grid {
    grid-template-columns: 1fr;
  }

  .investigations-container {
    padding: 16px;
  }
}
</style>
