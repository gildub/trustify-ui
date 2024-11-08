import React from "react";

import { Label, Skeleton } from "@patternfly/react-core";

import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { VulnerabilityGallery } from "@app/components/VulnerabilityGallery";
import { useSbomVulnerabilities } from "@app/hooks/domain-controls/useSbomVulnerabilities";

interface SBOMVulnerabilitiesProps {
  sbomId: string;
}

export const SBOMVulnerabilities: React.FC<SBOMVulnerabilitiesProps> = ({
  sbomId,
}) => {
  const { summary, isFetching, fetchError } = useSbomVulnerabilities(sbomId);

  return (
    <LoadingWrapper
      isFetching={isFetching}
      fetchError={fetchError}
      isFetchingState={<Skeleton screenreaderText="Loading contents" />}
      fetchErrorState={<Label color="red">Error</Label>}
    >
      <VulnerabilityGallery severities={summary.severities} />
    </LoadingWrapper>
  );
};
