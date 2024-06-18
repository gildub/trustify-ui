import React from "react";
import { GraphQLClient, gql } from "graphql-request";
import { useQuery } from "@tanstack/react-query";
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  TreeView,
  TreeViewDataItem,
  TreeViewSearch,
} from "@patternfly/react-core";

const client = new GraphQLClient("http://localhost:8080/graphql");

const query = gql`
  query {
    advisories: getAdvisories {
      name
      id
      children: vulnerabilities {
        name: identifier
        id
      }
    }
  }
`;
type Vulnerability = {
  id: string;
  name: string;
  children?: Vulnerability[];
};

type Advisory = {
  id: string;
  name: string;
  organization: { name: string };
  children?: Vulnerability[];
  defaultExpanded?: boolean;
};

type AdvisoryRequest = {
  advisories: Advisory[];
};

const useGetAdvisories = () => {
  const { isLoading, data } = useQuery({
    queryKey: ["advisories"],
    queryFn: async () => client.request<AdvisoryRequest>(query),
  });
  return {
    data: data && data.advisories ? data.advisories : [],
    isLoading: isLoading,
  };
};

export const Home: React.FC = () => {
  const { data: advs, isLoading } = useGetAdvisories();

  const [activeItems, setActiveItems] = React.useState<TreeViewDataItem[]>();
  const [filteredItems, setFilteredItems] = React.useState<Advisory[]>(advs);
  const [isFiltered, setIsFiltered] = React.useState(false);

  const onSelect = (
    _event: React.MouseEvent,
    treeViewItem: TreeViewDataItem
  ) => {
    // Ignore folders for selection
    if (treeViewItem && !treeViewItem.children) {
      setActiveItems([treeViewItem]);
    }
  };

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    if (input === "") {
      setFilteredItems(advs);
      setIsFiltered(false);
    } else {
      const filtered = advs
        ?.map((opt) => Object.assign({}, opt))
        .filter((item) => filterItems(item, input));
      setFilteredItems(filtered);
      setIsFiltered(true);
    }
  };

  const filterItems = (
    item: Advisory | Vulnerability,
    input: string
  ): boolean | undefined => {
    if (item.id.toLowerCase().includes(input.toLowerCase())) {
      return true;
    }
    if (item.children) {
      return (
        (item.children = item.children
          .map((opt) => Object.assign({}, opt))
          .filter((child) => filterItems(child, input))).length > 0
      );
    }
  };

  const toolbar = (
    <Toolbar style={{ padding: 0 }}>
      <ToolbarContent style={{ padding: 0 }}>
        <ToolbarItem widths={{ default: "100%" }}>
          <TreeViewSearch
            onSearch={onSearch}
            id="input-search"
            name="search-input"
            aria-label="Search input example"
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  React.useEffect(() => {
    if (advs.length > 0) {
      const tree = advs.map((adv) => ({
        ...adv,
        children: adv.children
          ? adv.children.map((vul) => ({
              ...vul,
              id: String(vul.id),
            }))
          : [],
      }));
      console.log("tree: ", tree);
      setFilteredItems(tree);
    }
  }, [advs, isLoading]);

  React.useEffect(() => {
    console.log("filteredItems: ", filteredItems);
  }, [filteredItems]);

  return (
    <>
      {isLoading || (filteredItems && filteredItems.length === 0) ? (
        <div>Loading...</div>
      ) : (
        <TreeView
          data={advs}
          activeItems={activeItems}
          onSelect={onSelect}
          allExpanded={isFiltered}
          toolbar={toolbar}
        />
      )}
    </>
  );
};
