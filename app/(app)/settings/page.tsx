"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconLogout } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/query";
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
} from "@/features/settings/query";
import { DEFAULT_SETTINGS } from "@/features/settings/constants";
import {
  THEME_OPTIONS,
  MERMAID_THEME_OPTIONS,
  MERMAID_LOOK_OPTIONS,
  TAB_SIZE_OPTIONS,
  AUTO_SAVE_DELAY_OPTIONS,
  EXPORT_FORMAT_OPTIONS,
} from "@/features/settings/constants";
import type { AppSettings } from "@/features/settings/types";
import { createClient } from "@/lib/supabase/client";

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingSelect<T extends string | number>({
  value,
  options,
  onValueChange,
  disabled,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onValueChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onValueChange(val as T)}
      disabled={disabled}
    >
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={String(opt.value)} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: user } = useAuth();
  const { data: settings } = useSettingsQuery();
  const { mutate: updateSettings } = useUpdateSettingsMutation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const s = settings ?? DEFAULT_SETTINGS;

  function update(updates: Partial<AppSettings>) {
    if ("theme" in updates && updates.theme) {
      setTheme(updates.theme);
    }
    updateSettings(updates);
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleReset() {
    setTheme(DEFAULT_SETTINGS.theme);
    updateSettings(DEFAULT_SETTINGS);
  }

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-6 p-6">
          {/* Appearance */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                <SettingRow label="Theme" description="App color scheme">
                  <SettingSelect
                    value={s.theme}
                    options={THEME_OPTIONS}
                    onValueChange={(v) => update({ theme: v })}
                  />
                </SettingRow>
                <SettingRow
                  label="Diagram theme"
                  description="Mermaid color palette"
                >
                  <SettingSelect
                    value={s.mermaidTheme}
                    options={MERMAID_THEME_OPTIONS}
                    onValueChange={(v) => update({ mermaidTheme: v })}
                  />
                </SettingRow>
                <SettingRow
                  label="Diagram style"
                  description="Rendering appearance"
                >
                  <SettingSelect
                    value={s.mermaidLook}
                    options={MERMAID_LOOK_OPTIONS}
                    onValueChange={(v) => update({ mermaidLook: v })}
                  />
                </SettingRow>
              </div>
            </CardContent>
          </Card>

          {/* Editor */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                <SettingRow label="Font size" description="12–20px">
                  <Input
                    type="number"
                    min={12}
                    max={20}
                    value={s.editorFontSize}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 12 && val <= 20) {
                        update({ editorFontSize: val });
                      }
                    }}
                    className="w-20 text-center"
                  />
                </SettingRow>
                <SettingRow label="Tab size">
                  <SettingSelect
                    value={s.editorTabSize}
                    options={TAB_SIZE_OPTIONS}
                    onValueChange={(v) => update({ editorTabSize: v })}
                  />
                </SettingRow>
                <SettingRow label="Word wrap">
                  <Switch
                    checked={s.editorWordWrap}
                    onCheckedChange={(v) => update({ editorWordWrap: v })}
                  />
                </SettingRow>
                <SettingRow label="Line numbers">
                  <Switch
                    checked={s.editorLineNumbers}
                    onCheckedChange={(v) => update({ editorLineNumbers: v })}
                  />
                </SettingRow>
                <SettingRow label="Minimap">
                  <Switch
                    checked={s.editorMinimap}
                    onCheckedChange={(v) => update({ editorMinimap: v })}
                  />
                </SettingRow>
              </div>
            </CardContent>
          </Card>

          {/* Auto-save */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Auto-save</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                <SettingRow
                  label="Enable auto-save"
                  description="Automatically save changes"
                >
                  <Switch
                    checked={s.autoSaveEnabled}
                    onCheckedChange={(v) => update({ autoSaveEnabled: v })}
                  />
                </SettingRow>
                <SettingRow
                  label="Auto-save delay"
                  description="Time after last edit"
                >
                  <SettingSelect
                    value={s.autoSaveDelay}
                    options={AUTO_SAVE_DELAY_OPTIONS}
                    onValueChange={(v) => update({ autoSaveDelay: v })}
                    disabled={!s.autoSaveEnabled}
                  />
                </SettingRow>
              </div>
            </CardContent>
          </Card>

          {/* Files & Export */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Files & Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                <SettingRow
                  label="Default export format"
                  description="Format used for quick exports"
                >
                  <SettingSelect
                    value={s.defaultExportFormat}
                    options={EXPORT_FORMAT_OPTIONS}
                    onValueChange={(v) => update({ defaultExportFormat: v })}
                  />
                </SettingRow>
                <SettingRow
                  label="Show file extensions"
                  description="Display .mmd in file tree"
                >
                  <Switch
                    checked={s.showFileExtensions}
                    onCheckedChange={(v) => update({ showFileExtensions: v })}
                  />
                </SettingRow>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          {user && (
            <Card size="sm">
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  <div className="flex items-center gap-3 py-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      <IconLogout className="size-4" />
                      {isSigningOut ? "Signing out..." : "Sign out"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reset */}
          <Card size="sm">
            <CardContent>
              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Reset settings</div>
                  <div className="text-xs text-muted-foreground">
                    Restore all settings to their defaults
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset all
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
