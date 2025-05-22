<template>
  <div class="d-flex wrapper">
    <!-- Sidebar -->
    <SideMenu />
    
    <!-- Main Content -->
    <div class="content-wrapper">
      <div class="container-fluid p-4">
        <div class="d-flex justify-content-end mb-3">
          <button class="btn btn-light btn-sm me-2">Take a tour</button>
          <button class="btn btn-light btn-sm me-2"><i class="bi bi-bell"></i></button>
          <button class="btn btn-light btn-sm rounded-circle">
            button
          </button>
        </div>
        
        <MedicalRecordForm :categories="categories" :tests="tests" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const categories = ref([]);
const tests = ref({});

// onMounted(async () => {
//   try {
//     // Fetch categories and tests from API
//     const response = await fetch('https://api.example.com/medical-tests');
//     const data = await response.json();
//     categories.value = data.categories;
//     tests.value = data.tests;
//   } catch (error) {
//     console.error('Error fetching medical tests:', error);
//     // Fallback data in case API fails
//     categories.value = ['X-Ray', 'Ultrasound Scan', 'CT Scan', 'MRI'];
//     tests.value = {
//       'X-Ray': [
//         'Chest', 'Cervical Vertebrae', 'Thoracic Vertebrae', 'Lumbar Vertebrae',
//         'Lumbo Sacral Vertebrae', 'Thoraco Lumbar Vertebrae', 'Wrist Joint', 'Thoracic Inlet',
//         'Shoulder Joint', 'Elbow Joint', 'Knee Joint', 'Sacro Iliac Joint',
//         'Pelvic Joint', 'Hip Joint', 'Femoral', 'Ankle',
//         'Humerus', 'Radius/Ulnar', 'Foot', 'Tibia/Fibula',
//         'Fingers', 'Toes'
//       ],
//       'Ultrasound Scan': ['Obstetric', 'Abdominal', 'Pelvis', 'Prostate', 'Breast', 'Thyroid'],
//       'CT Scan': ['Specify'],
//       'MRI': ['Specify']
//     };
//   }
// });
</script>

<style>
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';

.wrapper {
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
  background-color: #f8f9fa;
}
</style>