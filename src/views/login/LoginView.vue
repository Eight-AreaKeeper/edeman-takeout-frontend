<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { requiredRule } from '@/utils/validators'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

const rules = {
  username: [requiredRule('Please enter your username')],
  password: [requiredRule('Please enter your password')],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.login(form)
    router.push('/')
  } catch {
    // request layer already surfaces the server error message
  } finally {
    loading.value = false
  }
}

function handleKeyup(event: KeyboardEvent) {
  if (event.key === 'Enter') handleSubmit()
}
</script>

<template>
  <div class="login">
    <div class="login__panel">
      <div class="login__brand">
        <div class="login__logo">🍜</div>
        <h1>edeman</h1>
        <p>Admin console</p>
      </div>
    </div>

    <div class="login__form-wrap">
      <el-form ref="formRef" :model="form" :rules="rules" class="login__form" @submit.prevent>
        <h2>Sign in</h2>
        <p class="login__hint">Enter your credentials to access the admin console.</p>

        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="Username" size="large" @keyup="handleKeyup">
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Password"
            size="large"
            show-password
            @keyup="handleKeyup"
          >
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>

        <el-button type="primary" size="large" class="login__submit" :loading="loading" @click="handleSubmit">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
}
.login__panel {
  flex: 1.1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--ed-primary) 0%, var(--ed-primary-dark) 100%);
  color: #fff;
}
.login__brand {
  text-align: center;
}
.login__logo {
  font-size: 64px;
  line-height: 1;
  margin-bottom: 12px;
}
.login__brand h1 {
  font-size: 32px;
  margin: 0 0 8px;
  letter-spacing: 0.5px;
}
.login__brand p {
  margin: 0;
  opacity: 0.85;
}
.login__form-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ed-surface);
}
.login__form {
  width: 320px;
}
.login__form h2 {
  margin: 0 0 4px;
  font-size: 24px;
}
.login__hint {
  margin: 0 0 24px;
  color: var(--ed-text-secondary);
  font-size: 14px;
}
.login__submit {
  width: 100%;
}

@media (max-width: 768px) {
  .login__panel {
    display: none;
  }
}
</style>
