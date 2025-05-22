<template>
  <div class="sidebar bg-dark text-white">
    <div class="p-3 border-bottom">
      <h5 class="text-white">SEVENZ HEALTHCARE</h5>
    </div>
    <ul class="nav flex-column">
      <li class="nav-item" v-for="(item, index) in menuItems" :key="index">
        <a 
          class="nav-link d-flex align-items-center" 
          :class="{ 'active bg-primary': item.name === 'Dashboard' }"
          href="#"
        >
          <i class="bi" :class="item.icon"></i>
          <span class="ms-2">{{ item.name }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
const menuItems = [
  { name: 'Dashboard', icon: 'bi-grid' },
  { name: 'Profile', icon: 'bi-person' },
  { name: 'Services', icon: 'bi-briefcase' },
  { name: 'Medical Records', icon: 'bi-file-medical' },
  { name: 'Care Wallet', icon: 'bi-wallet2' },
  { name: 'Messages', icon: 'bi-chat-left-text' },
  { name: 'Resources', icon: 'bi-folder' },
  { name: 'Account Settings', icon: 'bi-gear' },
  { name: 'Contact Support', icon: 'bi-headset' },
  { name: 'Logout', icon: 'bi-box-arrow-right' }
];
</script>

<style scoped>
.sidebar {
  width: 250px;
  min-height: 100vh;
  position: sticky;
  top: 0;
}

.nav-link {
  color: rgba(255, 255, 255, 0.7);
  padding: 0.75rem 1rem;
}

.nav-link:hover, .nav-link.active {
  color: white;
}

.nav-link i {
  width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  
  .sidebar h5, .sidebar .nav-link span {
    display: none;
  }
  
  .sidebar .nav-link i {
    font-size: 1.25rem;
  }
}
</style>