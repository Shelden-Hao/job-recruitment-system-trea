<template>
  <div class="review-form">
    <u-form :model="reviewForm" :rules="rules" ref="formRef" label-width="100px">
      <u-form-item label="评分" prop="rating">
        <u-rate
          v-model="reviewForm.rating"
          :count="5"
          :active-color="['#99A9BF', '#F7BA2A', '#FF9900']"
          :texts="['很差', '较差', '一般', '较好', '很好']"
          show-text
        />
      </u-form-item>
      
      <u-form-item label="评价内容" prop="content">
        <u-input
          type="textarea"
          v-model="reviewForm.content"
          :rows="4"
          placeholder="请输入您的评价内容"
        />
      </u-form-item>
      
      <u-form-item label="优点" prop="pros">
        <u-input
          type="textarea"
          v-model="reviewForm.pros"
          :rows="2"
          placeholder="请输入优点"
        />
      </u-form-item>
      
      <u-form-item label="缺点" prop="cons">
        <u-input
          type="textarea"
          v-model="reviewForm.cons"
          :rows="2"
          placeholder="请输入缺点"
        />
      </u-form-item>
      
      <u-form-item>
        <u-checkbox v-model="reviewForm.isAnonymous">匿名评价</u-checkbox>
      </u-form-item>
      
      <u-form-item>
        <u-button type="primary" @click="submitForm" :loading="loading">提交评价</u-button>
        <u-button @click="resetForm">重置</u-button>
      </u-form-item>
    </u-form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useStore } from 'uni-mini-store';
import { reviewAPI } from '@/services/api';

export default {
  name: 'ReviewForm',
  props: {
    targetId: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      required: true,
      validator: (value) => ['job', 'company', 'jobseeker'].includes(value)
    }
  },
  emits: ['submit-success'],
  setup(props, { emit }) {
    const formRef = ref(null);
    const loading = ref(false);
    
    const reviewForm = reactive({
      rating: 0,
      content: '',
      pros: '',
      cons: '',
      isAnonymous: false
    });
    
    const rules = {
      rating: [
        { required: true, message: '请选择评分', trigger: 'change' },
        { type: 'number', min: 1, max: 5, message: '评分范围为1-5', trigger: 'change' }
      ],
      content: [
        { required: true, message: '请输入评价内容', trigger: 'blur' },
        { min: 10, message: '评价内容至少10个字符', trigger: 'blur' }
      ]
    };
    
    const store = useStore();
    
    const submitForm = async () => {
      if (!formRef.value) return;
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true;
          try {
            const reviewData = {
              ...reviewForm,
              targetId: props.targetId,
              targetType: props.targetType
            };
            
            const response = await reviewAPI.createReview(reviewData);
            store.dispatch('showToast', {
              title: '评价提交成功',
              message: '等待审核',
              type: 'success'
            });
            emit('submit-success', response.data.review);
            resetForm();
          } catch (error) {
            console.error('提交评价失败:', error);
            store.dispatch('showToast', {
              title: '提交评价失败',
              message: error.response?.data?.message || '提交评价失败',
              type: 'error'
            });
          } finally {
            loading.value = false;
          }
        }
      });
    };
    
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields();
      }
    };
    
    return {
      formRef,
      reviewForm,
      rules,
      loading,
      submitForm,
      resetForm
    };
  }
};
</script>

<style scoped>
.review-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>