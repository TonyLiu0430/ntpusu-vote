<template>
  <div class="flex flex-wrap justify-center">
    <el-space direction="vertical">
      <el-skeleton
        style="width: 300px"
        :loading="timelineLoading"
        :rows="15"
        :throttle="100"
        animated
      >
        <template #default>
          <ElSteps
            direction="vertical"
            align-center
            space="12dvh"
            class="mt-5 w-full !flex-wrap content-center"
          >
            <ElStep
              v-for="(activity, index) in activities"
              :key="index"
              :status="style(activity.start, activity.end)"
              class="tracking-[1.5px]"
            >
              <template #title>
                <div class="font-bold sm:text-lg">
                  {{ activity.content }}
                </div>
              </template>
              <template #description>
                <div class="min-w-max sm:text-base">
                  <span>{{
                    activity.start.toLocaleString(undefined, {
                      dateStyle: "long",
                      timeStyle: activity.showTime ? "medium" : undefined,
                    })
                  }}</span>
                  <span v-if="activity.showEnd"> 〜 </span>
                  <span v-if="activity.showEnd && !activity.showTime">{{
                    activity.end.toLocaleString(undefined, {
                      dateStyle: "long",
                      timeStyle: activity.showTime ? "medium" : undefined,
                    })
                  }}</span>
                </div>
                <div
                  v-if="activity.showEnd && activity.showTime"
                  class="min-w-max sm:text-base"
                >
                  {{
                    activity.end.toLocaleString(undefined, {
                      dateStyle: "long",
                      timeStyle: activity.showTime ? "medium" : undefined,
                    })
                  }}
                </div>
              </template>
            </ElStep>
          </ElSteps>
        </template>
      </el-skeleton>
      <ElButton
        v-if="status === 'authenticated'"
        type="success"
        class="z-10 mt-2 mb-8"
        @click="useRouter().push('/vote')"
      >
        <span class="font-bold">前 往 投 票 頁 面</span>
      </ElButton>
      <ElButton
        v-else
        type="primary"
        class="z-10 mt-2 mb-8"
        @click="useRouter().push('/login')"
      >
        <span class="font-bold">前 往 登 入 頁 面</span>
      </ElButton>
    </el-space>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false,
  title: "首頁",
});

const router = useRouter();
const { status } = useAuthState();

const style = (start: Date, end: Date) => {
  return Date.now() < start.getTime()
    ? "process"
    : Date.now() < end.getTime()
      ? "finish"
      : "success";
};

const { data: activities, pending: timelineLoading } = useFetch(
  "/api/timeline/get",
  {
    method: "GET",
    transform: (activities_origin) =>
      activities_origin.map((activity) => {
        return {
          ...activity,
          start: new Date(activity.start),
          end: new Date(activity.end),
        };
      }),
  },
);

</script>
