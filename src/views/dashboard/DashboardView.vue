<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getBusinessData,
  getDishOverview,
  getOrderOverview,
  getSetmealOverview,
  type BusinessData,
  type DishOverview,
  type OrderOverview,
  type SetmealOverview,
} from '@/api/workspace'
import {
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_TO_BE_CONFIRMED,
  getOrderPage,
  type Order,
} from '@/api/order'
import { usePagination } from '@/composables/usePagination'
import { useOrderActions } from '@/composables/useOrderActions'
import OrderDetailDialog from '@/components/OrderDetailDialog.vue'
import CancelReasonDialog from '@/components/CancelReasonDialog.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()

const business = ref<BusinessData>()
const orderOverview = ref<OrderOverview>()
const dishOverview = ref<DishOverview>()
const setmealOverview = ref<SetmealOverview>()

async function loadOverviews() {
  ;[business.value, orderOverview.value, dishOverview.value, setmealOverview.value] = await Promise.all([
    getBusinessData(),
    getOrderOverview(),
    getDishOverview(),
    getSetmealOverview(),
  ])
}

// --- Embedded pending-orders list, scoped to "to be confirmed" / "to be delivered" ---
const pendingTab = ref(ORDER_STATUS_TO_BE_CONFIRMED)

const {
  records: pendingOrders,
  total: pendingTotal,
  page: pendingPage,
  loading: pendingLoading,
  search: searchPending,
  handlePageChange: handlePendingPageChange,
} = usePagination(getOrderPage, () => ({ status: pendingTab.value }))

function refreshPending() {
  searchPending()
  loadOverviews()
}

const orderActions = useOrderActions(refreshPending)

function switchPendingTab(status: number) {
  pendingTab.value = status
  searchPending()
}

onMounted(() => {
  loadOverviews()
  searchPending()
})
</script>

<template>
  <div class="ed-page">
    <div class="ed-card">
      <div class="dash-section__header">
        <h3>Today's data</h3>
        <el-button link type="primary" @click="router.push('/statistics')">Details →</el-button>
      </div>
      <div class="dash-stats" v-if="business">
        <div class="dash-stat">
          <div class="dash-stat__value">¥{{ business.turnover.toFixed(2) }}</div>
          <div class="dash-stat__label">Turnover</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat__value">{{ business.validOrderCount }}</div>
          <div class="dash-stat__label">Valid orders</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat__value">{{ (business.orderCompletionRate * 100).toFixed(1) }}%</div>
          <div class="dash-stat__label">Completion rate</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat__value">¥{{ business.unitPrice.toFixed(2) }}</div>
          <div class="dash-stat__label">Avg. order value</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat__value">{{ business.newUsers }}</div>
          <div class="dash-stat__label">New customers</div>
        </div>
      </div>
    </div>

    <div class="ed-card">
      <div class="dash-section__header"><h3>Orders</h3></div>
      <div class="dash-stats" v-if="orderOverview">
        <div class="dash-stat dash-stat--clickable" @click="router.push('/order?status=2')">
          <div class="dash-stat__value">{{ orderOverview.waitingOrders }}</div>
          <div class="dash-stat__label">To be confirmed</div>
        </div>
        <div class="dash-stat dash-stat--clickable" @click="router.push('/order?status=3')">
          <div class="dash-stat__value">{{ orderOverview.deliveredOrders }}</div>
          <div class="dash-stat__label">To be delivered</div>
        </div>
        <div class="dash-stat dash-stat--clickable" @click="router.push('/order?status=5')">
          <div class="dash-stat__value">{{ orderOverview.completedOrders }}</div>
          <div class="dash-stat__label">Completed</div>
        </div>
        <div class="dash-stat dash-stat--clickable" @click="router.push('/order?status=6')">
          <div class="dash-stat__value">{{ orderOverview.cancelledOrders }}</div>
          <div class="dash-stat__label">Cancelled</div>
        </div>
        <div class="dash-stat dash-stat--clickable" @click="router.push('/order')">
          <div class="dash-stat__value">{{ orderOverview.allOrders }}</div>
          <div class="dash-stat__label">All orders</div>
        </div>
      </div>
    </div>

    <div class="dash-row">
      <div class="ed-card dash-row__card">
        <div class="dash-section__header">
          <h3>Dishes</h3>
          <el-button link type="primary" @click="router.push('/dish/add')">+ Add dish</el-button>
        </div>
        <div class="dash-stats" v-if="dishOverview">
          <div class="dash-stat">
            <div class="dash-stat__value">{{ dishOverview.sold }}</div>
            <div class="dash-stat__label">On sale</div>
          </div>
          <div class="dash-stat">
            <div class="dash-stat__value">{{ dishOverview.discontinued }}</div>
            <div class="dash-stat__label">Discontinued</div>
          </div>
        </div>
      </div>

      <div class="ed-card dash-row__card">
        <div class="dash-section__header">
          <h3>Set meals</h3>
          <el-button link type="primary" @click="router.push('/setmeal/add')">+ Add set meal</el-button>
        </div>
        <div class="dash-stats" v-if="setmealOverview">
          <div class="dash-stat">
            <div class="dash-stat__value">{{ setmealOverview.sold }}</div>
            <div class="dash-stat__label">On sale</div>
          </div>
          <div class="dash-stat">
            <div class="dash-stat__value">{{ setmealOverview.discontinued }}</div>
            <div class="dash-stat__label">Discontinued</div>
          </div>
        </div>
      </div>
    </div>

    <div class="ed-card">
      <div class="dash-section__header"><h3>Pending orders</h3></div>
      <el-tabs :model-value="pendingTab" @tab-change="(name: number) => switchPendingTab(name)">
        <el-tab-pane label="To be confirmed" :name="ORDER_STATUS_TO_BE_CONFIRMED" />
        <el-tab-pane label="To be delivered" :name="ORDER_STATUS_CONFIRMED" />
      </el-tabs>

      <el-table v-loading="pendingLoading" :data="pendingOrders" row-key="id">
        <el-table-column prop="number" label="Order #" width="180" />
        <el-table-column label="Customer" width="180">
          <template #default="{ row }: { row: Order }">{{ row.consignee }} · {{ row.phone }}</template>
        </el-table-column>
        <el-table-column prop="address" label="Address" min-width="200" show-overflow-tooltip />
        <el-table-column prop="orderTime" label="Order time" width="170" />
        <el-table-column label="Amount" width="100">
          <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }: { row: Order }">
            <el-button link type="primary" @click="orderActions.viewDetail(row.id)">View</el-button>
            <el-button
              v-if="row.status === ORDER_STATUS_TO_BE_CONFIRMED"
              link
              type="primary"
              @click="orderActions.accept(row.id)"
            >
              Accept
            </el-button>
            <el-button
              v-if="row.status === ORDER_STATUS_TO_BE_CONFIRMED"
              link
              type="danger"
              @click="orderActions.openReasonDialog(row.id, 'reject')"
            >
              Reject
            </el-button>
            <el-button v-if="row.status === ORDER_STATUS_CONFIRMED" link type="primary" @click="orderActions.deliver(row.id)">
              Deliver
            </el-button>
          </template>
        </el-table-column>
        <template #empty><EmptyState :searching="false" /></template>
      </el-table>

      <div class="ed-pagination" v-if="pendingTotal > 10">
        <el-pagination
          v-model:current-page="pendingPage"
          :total="pendingTotal"
          layout="total, prev, pager, next"
          @current-change="handlePendingPageChange"
        />
      </div>
    </div>

    <OrderDetailDialog :actions="orderActions" />
    <CancelReasonDialog :actions="orderActions" />
  </div>
</template>

<style scoped>
.dash-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.dash-section__header h3 {
  margin: 0;
  font-size: 16px;
}
.dash-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.dash-row__card {
  margin: 0;
}
</style>
