import React from "react";

export function PageRoot() {
  return (
    <div className="font-sans items-center justify-items-center min-h-screen px-8 py-3">
      <p>
        This enables users to pull information out of Azure DevOps in a way that
        allows for easy analysis and reporting.
      </p>

      <h4 className="text-md font-bold mt-3">What do I need to use this?</h4>
      <p>
        You will need to have an Azure DevOps account, and a Personal Access
        Token (PAT) with the appropriate permissions to access the data you want
        to pull. You can create a PAT in your Azure DevOps account settings.
        It's recommended to create a new PAT with read-only permissions for the
        scopes below, which helps to ensure the security of your Azure DevOps
        account while allowing you to use this tool effectively.
      </p>
      <p className="mt-2">
        Required scopes:
        <ul className="list-disc list-inside ml-2">
          <li>Analytics (read)</li>
          <li>Work Items (read)</li>
          <li>Project and Team (read)</li>
          <li>Workitems (read)</li>
        </ul>
      </p>

      <h4 className="text-md font-bold mt-3">Can you see my data?</h4>
      <p>
        All code in this tool runs locally on your machine, so your PAT is not
        stored or transmitted anywhere else. Go to the Settings page to enter
        your PAT before you first use the tool, and it will be stored on your
        machine for future use.
      </p>
      <p>
        Of course, as with anything on the Internet, proceed with caution. All
        the code is open source and available for you to review, so feel free to
        check it out if you have any concerns. You can find the code on GitHub
        at
        <a
          href="https://github.com/jonifen/ado-helper"
          className="underline ml-1"
        >
          https://github.com/jonifen/ado-helper
        </a>
        .
      </p>

      <h4 className="text-md font-bold mt-3">How do I use this?</h4>
      <p>
        Once you've entered your PAT in the Settings page, you can navigate to
        the Teams page to see a list of your teams. Click on a team to see its
        iterations, and click on an iteration to see more details about it.
      </p>
    </div>
  );
}
