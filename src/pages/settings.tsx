import React from "react";
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

  const onSubmit = async (data) => {
    console.log("data", data);
    saveSettings(data);
  };

  const onInvalid = async (data) => {
    console.log("data", data);
    alert("An error when saving the settings. Please check the form for errors.");
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
        </div>
      </form>
    </div>
  );
}
