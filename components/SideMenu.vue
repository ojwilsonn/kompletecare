<template>
  <div class="sidebar">
    <div class="dashboard-header">
      <i class="bi bi-grid"></i>
      <span>Dashboard</span>
    </div>

    <ul class="nav-list">
      <li class="nav-item" v-for="(item, index) in menuItems" :key="index">
        <a href="#" class="nav-link">
          <i class="bi" :class="item.icon"></i>
          <span>{{ item.name }}</span>
          <i
            v-if="item.hasDropdown"
            class="bi bi-chevron-right dropdown-arrow"
          ></i>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
const menuItems = [
  { name: "Profile", icon: "bi-person-fill" },
  { name: "Services", icon: "bi-dropbox" },
  { name: "Medical Records", icon: "bi-file-medical" },
  { name: "Care Wallet", icon: "bi-wallet2" },
  { name: "Messages", icon: "bi-chat-left-text" },
  { name: "Resources", icon: "bi-folder" },
  { name: "Account Settings", icon: "bi-gear" },
  { name: "Contact Support", icon: "bi-headset" },
  { name: "Logout", icon: "bi-box-arrow-right" },
];
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e9ecef;
}

.dashboard-header {
  background-color: #2a36a4;
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #a0a0a0;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  border: none;
  background: none;
}
.nav-link:hover,
.nav-link.active {
  background-color: #2a36a4;
  color: #ffffff;
}

.dropdown-arrow {
  margin-left: auto;
  font-size: 14px;
  color: #adb5bd;
}

.bi {
  margin-right: 12px;
  font-size: 16px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 0;
}

.nav-link i {
  width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .dashboard-header span,
  .nav-link span {
    display: none;
  }

  .dropdown-arrow {
    display: none;
  }

  .dashboard-header,
  .nav-link {
    justify-content: center;
  }

  .sidebar h5,
  .sidebar .nav-link span {
    display: none;
  }

  .sidebar .nav-link i {
    font-size: 1.25rem;
  }
}
</style>
