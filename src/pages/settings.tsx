import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSettingsStore } from "../data/settings-store.js";

export function Settings() {
  const { pat, organisation, project, saveSettings } = useSettingsStore((state) => state);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    name: "settings",
  });
  const [statusMessage, setStatusMessage] = useState("");

  const onSubmit = async (data) => {
    const patChanged = data.pat !== pat;

    // Base64 encode the PAT (prefixed with a colon) as per Azure DevOps requirements
    const encodedPAT = btoa(`:${data.pat}`);

    saveSettings({
      ...data,
      pat: patChanged ? encodedPAT : pat,
    });
    setStatusMessage("Settings saved successfully!");
  };

  const onInvalid = async (data) => {
    console.log("data", data);
    alert("An error when saving the settings. Please check the form for errors.");
    setStatusMessage("Failed to save settings. Please correct the errors and try again.");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="py-2">
          <label className="block">PAT:</label>
          <input
            {...register("pat", { required: true })}
            defaultValue={pat}
            className="border border-slate-600 p-2 w-[80%]"
          />
          {errors.pat && <p>The PAT is required</p>}
        </div>
        <div className="py-2">
          <label className="block">Organisation Name:</label>
          <input
            {...register("organisation", { required: true })}
            defaultValue={organisation}
            className="border border-slate-600 p-2 w-[80%]"
          />
          {errors.organisation && <p>The organisation name is required</p>}
        </div>
        <div className="py-2">
          <label className="block">Project:</label>
          <input
            {...register("project", { required: true })}
            defaultValue={project}
            className="border border-slate-600 p-2 w-[80%]"
          />
          {errors.project && <p>The project name is required</p>}
        </div>
        <div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Save settings
          </button>
          {statusMessage && <p className="text-green-600">{statusMessage}</p>}
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Note: The PAT will be stored in an encoded format for security reasons. If you update the PAT, it will be re-encoded before saving.
          </p>
        </div>
      </form>
    </div>
  );
}
