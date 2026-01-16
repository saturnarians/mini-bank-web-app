// "use client";

// import { useState } from "react";
// // Highlighting changes: Use your internal UI library components
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";

// export function MfaToggle({ defaultEnabled = false }: { defaultEnabled?: boolean }) {
//   const [enabled, setEnabled] = useState(defaultEnabled);

//   return (
//     <div className="flex items-center space-x-2">
//       {/* Highlighting changes: Added Label with htmlFor linked to Switch id */}
//       <Label htmlFor="mfa-mode" className="cursor-pointer">
//         Two-Factor Authentication
//       </Label>
      
//       <Switch
//         id="mfa-mode"
//         checked={enabled}
//         onCheckedChange={setEnabled}
//       />
//     </div>
//   );
// }