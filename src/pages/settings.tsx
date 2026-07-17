import React from "react";
import { useForm } from "react-hook-form";
import { useSettingsStore } from "../data/settings-store.js";

export function Settings() {
  const settingsStore = useSettingsStore((state) => state);
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
  };

  const onInvalid = async (data) => {
    console.log("data", data);
  };

  return (
    <div>
      <p>Settings</p>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="py-2">
          <label className="block">PAT:</label>
          <input
            {...register("pat", { required: true })}
            defaultValue={settingsStore.pat}
            className="border border-slate-600 p-2 w-[80%]"
          />
          {errors.pat && <p>The PAT is required</p>}
        </div>
        <div className="py-2">
          <label className="block">Organisation Name:</label>
          <input
            {...register("organisation", { required: true })}
            defaultValue={settingsStore.organisation}
            className="border border-slate-600 p-2 w-[80%]"
          />
          {errors.organisation && <p>The organisation name is required</p>}
        </div>
        <div className="py-2">
          <label className="block">Project:</label>
          <input
            {...register("project", { required: true })}
            defaultValue={settingsStore.project}
            className="border border-slate-600 p-2 w-[80%]"
          />
          {errors.project && <p>The project name is required</p>}
        </div>
        <div>
          <button onSubmit={handleSubmit(onSubmit, onInvalid)}>
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
