<template>
  <a-modal :visible="visible" @update:visible="val => $emit('update:visible', val)" :title="modalTitle" width="70vw"
    ok-text="Save" cancel-text="Cancel" @cancel="handleCancel" @ok="handleOk" :mask-closable="false">
    <a-form :model="form" layout="vertical" class="engine-form">
      <!-- Engine Properties -->
      <a-divider orientation="left">Engine Properties</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="Name" field="name" :validate-status="nameError ? 'error' : undefined"
            :help="nameError || undefined">
            <a-input v-model="form.name" placeholder="TOOL" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Device ID" field="deviceId">
            <a-input v-model="form.deviceId" placeholder="10" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Type" field="type">
            <a-select v-model="form.type" placeholder="HSMS">
              <a-option value="HSMS">HSMS</a-option>
              <a-option value="SECS-I">SECS-I</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Communication Configuration -->
      <a-divider orientation="left">Communication Configuration</a-divider>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="Serial Port" field="serialPort">
            <a-select v-model="form.serialPort" placeholder="COM1">
              <a-option v-for="i in 4" :key="i" :value="`COM${i}`">COM{{ i }}</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Baud" field="baud">
            <a-select v-model="form.baud" placeholder="9600">
              <a-option value="9600">9600</a-option>
              <a-option value="19200">19200</a-option>
              <a-option value="38400">38400</a-option>
              <a-option value="57600">57600</a-option>
              <a-option value="115200">115200</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="Retry" field="retry">
            <a-input-number v-model="form.retry" :min="0" :max="10" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Master" field="master">
            <a-select v-model="form.master" placeholder="Master">
              <a-option value="Master">Master</a-option>
              <a-option value="Slave">Slave</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="TCP Port" field="tcpPort">
            <a-input v-model="form.tcpPort" placeholder="5001" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Simulate" field="simulate">
            <a-select v-model="form.simulate" placeholder="Equipment">
              <a-option value="Equipment">Equipment</a-option>
              <a-option value="Host">Host</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="Remote IP" field="remoteIp">
            <a-input v-model="form.remoteIp" placeholder="127.0.0.1" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Local IP" field="localIp">
            <a-input v-model="form.localIp" placeholder="127.0.0.1" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="Max Length" field="maxLength">
            <a-input v-model="form.maxLength" placeholder="9437184" />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Timeout Parameters -->
      <a-divider orientation="left">Timeout Parameters (T0-T8)</a-divider>
      <a-row :gutter="16">
        <a-col :span="8" v-for="i in 9" :key="i">
          <a-form-item :label="`T${i - 1}`" :field="`t${i - 1}`">
            <a-input v-model="form[`t${i - 1}` as keyof typeof form]" />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Advanced Settings -->
      <a-divider orientation="left">Advance setting</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="Data Bit" field="dataBit">
            <a-select v-model="form.dataBit" placeholder="8">
              <a-option value="5">5</a-option>
              <a-option value="6">6</a-option>
              <a-option value="7">7</a-option>
              <a-option value="8">8</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Stop Bit" field="stopBit">
            <a-select v-model="form.stopBit" placeholder="1">
              <a-option value="1">1</a-option>
              <a-option value="1.5">1.5</a-option>
              <a-option value="2">2</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Parity" field="parity">
            <a-select v-model="form.parity" placeholder="None">
              <a-option value="None">None</a-option>
              <a-option value="Odd">Odd</a-option>
              <a-option value="Even">Even</a-option>
              <a-option value="Mark">Mark</a-option>
              <a-option value="Space">Space</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  visible: boolean;
  initialData?: any;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'submit', data: any): void;
}>();

const defaultForm = {
  name: 'TOOL',
  deviceId: '10',
  type: 'HSMS',
  serialPort: 'COM1',
  baud: '9600',
  retry: 3,
  master: 'Master',
  tcpPort: '5001',
  simulate: 'Equipment',
  remoteIp: '127.0.0.1',
  localIp: '127.0.0.1',
  maxLength: '9437184',
  t0: '500',
  t1: '10',
  t2: '45',
  t3: '180',
  t4: '120',
  t5: '10',
  t6: '10',
  t7: '10',
  t8: '10',
  dataBit: '8',
  stopBit: '1',
  parity: 'None'
};

const form = ref({ ...defaultForm });
const nameError = ref('');

const modalTitle = computed(() => (props.initialData ? 'Edit Engine Properties' : 'Engine Properties'));

/**
 * Watch for visibility changes to reset or populate the form.
 */
watch(() => props.visible, (val) => {
  if (val) {
    if (props.initialData) {
      // Mock logic to parse name back to deviceId and name, 
      // since we don't store full config in the list yet.
      const nameParts = props.initialData.name.split('. ');
      let deviceId = '10';
      let name = 'TOOL';
      if (nameParts.length > 1) {
        deviceId = nameParts[0];
        name = nameParts.slice(1).join('. ');
      } else {
        name = props.initialData.name;
      }

      form.value = {
        ...defaultForm,
        ...props.initialData,
        name,
        deviceId
      };
    } else {
      form.value = { ...defaultForm };
    }
  }
});

const handleCancel = () => {
  emit('update:visible', false);
};

watch(
  () => form.value.name,
  (val) => {
    const name = String(val || '');
    if (!name) {
      nameError.value = 'Engine name is required';
    } else if (/\s/.test(name) || name.includes('-')) {
      nameError.value = 'Engine name cannot contain spaces or "-"';
    } else {
      nameError.value = '';
    }
  },
  { immediate: true }
);

const handleOk = () => {
  const name = String(form.value.name || '');

  if (!name || /\s/.test(name) || name.includes('-')) {
    if (!nameError.value) {
      if (!name) {
        nameError.value = 'Engine name is required';
      } else {
        nameError.value = 'Engine name cannot contain spaces or "-"';
      }
    }
    return;
  }

  const submitData = {
    ...form.value
  };

  emit('submit', submitData);
};
</script>

<style scoped>
.engine-form {
  padding: 0 10px;
}
</style>
