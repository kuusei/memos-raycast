import { Action, ActionPanel, Alert, confirmAlert, Icon, LaunchProps, List, showToast, Toast } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { archiveMemo, deleteMemo, getAllMemos, getMe, getRequestUrl, restoreMemo } from "./api";
import { MemoInfoResponse, ROW_STATUS } from "./types";

interface SearchArguments {
  text: string;
}

export default function MemosListCommand(props: LaunchProps<{ arguments: SearchArguments }>): JSX.Element {
  const [currentUserId, setCurrentUserId] = useState<number>();
  const [state, setState] = useState(ROW_STATUS.NORMAL);
  const { isLoading, data, revalidate, pagination } = getAllMemos(currentUserId, { state });
  const { isLoading: isLoadingUser, data: user } = getMe();
  const [searchText, setSearchText] = useState(props.arguments.text ?? "");
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  useEffect(() => {
    if (!isLoadingUser && user.name) {
      const userId = +user.name.split("/")[1];
      setCurrentUserId(userId);
    }
  }, [isLoadingUser]);

  useEffect(() => {
    if (currentUserId) {
      revalidate();
    }
  }, [currentUserId]);

  function getItemUrl(item: MemoInfoResponse) {
    const url = getRequestUrl(`/m/${item.uid}`);

    return url;
  }

  function getItemMarkdown(item: MemoInfoResponse) {
    const { content, resources } = item;
    let markdown = content;

    const resourceMarkdowns = resources.map((resource, index) => {
      return `\n![${index}](${resource.externalLink})`;
    });
    markdown += resourceMarkdowns.join(" ");

    return markdown;
  }

  const filterList = useMemo(() => {
    return (data || [])
      .filter((item) => item.content.includes(debouncedSearchText))
      .map((item) => {
        item.markdown = getItemMarkdown(item);
        return item;
      });
  }, [data, debouncedSearchText]);

  async function onArchive(item: MemoInfoResponse) {
    if (
      await confirmAlert({
        title: "Are you sure?",
        icon: Icon.Store,
        primaryAction: {
          title: "Archive",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      showToast({
        style: Toast.Style.Animated,
        title: "Archive...",
      });
      const res = await archiveMemo(item.name).catch(() => {
        //
      });

      if (res) {
        showToast(Toast.Style.Success, "Archive Success");

        revalidate();
      } else {
        showToast(Toast.Style.Failure, "Archive Failed");
      }
    }
  }

  async function onDelete(item: MemoInfoResponse) {
    if (
      await confirmAlert({
        title: "Are you sure?",
        icon: Icon.Trash,
        primaryAction: {
          title: "Delete",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      showToast({
        style: Toast.Style.Animated,
        title: "Delete...",
      });
      const res = await deleteMemo(item.name).catch(() => {
        //
      });

      if (res) {
        showToast(Toast.Style.Success, "Delete Success");

        revalidate();
      } else {
        showToast(Toast.Style.Failure, "Delete Failed");
      }
    }
  }

  async function onRestore(item: MemoInfoResponse) {
    if (
      await confirmAlert({
        title: "Are you sure?",
        icon: Icon.Redo,
        primaryAction: {
          title: "Restore",
          style: Alert.ActionStyle.Default,
        },
      })
    ) {
      showToast({
        style: Toast.Style.Animated,
        title: "Restore...",
      });
      const res = await restoreMemo(item.name).catch(() => {
        //
      });

      if (res) {
        showToast(Toast.Style.Success, "Restore Success");

        revalidate();
      } else {
        showToast(Toast.Style.Failure, "Restore Failed");
      }
    }
  }

  const archiveComponent = (item: MemoInfoResponse) => (
    <Action
      title="Archive"
      icon={Icon.Store}
      style={Action.Style.Destructive}
      onAction={() => onArchive(item)}
      shortcut={{ modifiers: ["cmd"], key: "s" }}
    />
  );

  const deleteComponent = (item: MemoInfoResponse) => (
    <Action
      title="Delete"
      icon={Icon.Trash}
      style={Action.Style.Destructive}
      onAction={() => onDelete(item)}
      shortcut={{ modifiers: ["cmd"], key: "d" }}
    />
  );

  const restoreComponent = (item: MemoInfoResponse) => (
    <Action
      title="Restore"
      icon={Icon.Redo}
      style={Action.Style.Regular}
      onAction={() => onRestore(item)}
      shortcut={{ modifiers: ["cmd"], key: "r" }}
    />
  );

  return (
    <List
      isLoading={isLoading}
      filtering={false}
      onSearchTextChange={setSearchText}
      searchText={searchText}
      navigationTitle="Search Memos"
      searchBarPlaceholder="Search your memo..."
      isShowingDetail
      pagination={pagination}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Dropdown With Items"
          onChange={(newValue) => {
            setState(newValue as ROW_STATUS);
          }}
        >
          <List.Dropdown.Item title={ROW_STATUS.ALL} value={ROW_STATUS.ALL} />
          <List.Dropdown.Item title={ROW_STATUS.NORMAL} value={ROW_STATUS.NORMAL} />
          <List.Dropdown.Item title={ROW_STATUS.ARCHIVED} value={ROW_STATUS.ARCHIVED} />
        </List.Dropdown>
      }
    >
      {filterList.map((item) => (
        <List.Item
          key={item.name}
          title={item.content}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={getItemUrl(item)} />
              <Action.CopyToClipboard title="Copy Content" content={item.markdown ?? ""} />
              <Action.CopyToClipboard title="Copy URL" content={getItemUrl(item)} />
              {(item.rowStatus !== ROW_STATUS.ARCHIVED && archiveComponent(item)) || null}
              {(item.rowStatus === ROW_STATUS.ARCHIVED && restoreComponent(item)) || null}
              {deleteComponent(item)}
            </ActionPanel>
          }
          detail={
            <List.Item.Detail
              markdown={item.markdown}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.TagList title="Pin">
                    <List.Item.Detail.Metadata.TagList.Item
                      text={item.pinned ? "True" : "False"}
                      color={item.pinned ? "green" : "red"}
                    />
                  </List.Item.Detail.Metadata.TagList>
                  <List.Item.Detail.Metadata.TagList title="Visibility">
                    <List.Item.Detail.Metadata.TagList.Item
                      text={item.visibility.toUpperCase()}
                      color={item.visibility === "PUBLIC" ? "green" : "red"}
                    />
                  </List.Item.Detail.Metadata.TagList>
                  <List.Item.Detail.Metadata.TagList title="Tags">
                    {item.property.tags.map((tag) => (
                      <List.Item.Detail.Metadata.TagList.Item text={tag} color="blue" />
                    ))}
                  </List.Item.Detail.Metadata.TagList>
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title="Create Time"
                    text={new Date(item.createTime).toLocaleString()}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Update Time"
                    text={new Date(item.updateTime).toLocaleString()}
                  />
                </List.Item.Detail.Metadata>
              }
            />
          }
        />
      ))}
    </List>
  );
}
