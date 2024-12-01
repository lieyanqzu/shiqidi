import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function ComponentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-8">组件示例</h1>
      
      <section className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-medium">按钮</h2>
          <div className="flex gap-4">
            <Button>主要按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium">输入框</h2>
          <div className="max-w-sm space-y-4">
            <Input label="用户名" placeholder="请输入用户名" />
            <Input 
              label="密码" 
              type="password" 
              placeholder="请输入密码"
              error="密码不能为空" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium">下拉框</h2>
          <div className="max-w-sm">
            <Select
              label="赛制"
              options={[
                { label: "标准", value: "standard" },
                { label: "先驱", value: "pioneer" },
                { label: "摩登", value: "modern" },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
} 