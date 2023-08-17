import { Combobox, Transition } from "@headlessui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { Fragment, useState } from "react";
import { HiChevronUpDown } from "react-icons/hi2";
import { db, updateLog } from "../db";
import { Tag } from "../types/core";

export function Tags({ logId }: { logId: number }) {
  const [query, setQuery] = useState("");
  const queryTags = useLiveQuery(async () => {
    // Use query to prefix search
    const tags = await db.tags
      .where("name")
      .startsWithIgnoreCase(query)
      .toArray();
    return tags;
  }, [query]);
  const logTags = useLiveQuery(async () => {
    if (logId === undefined) return [];
    const log = await db.logs.get(logId);
    const tags = await Promise.all(
      log?.tags?.map(async (tagId) => await db.tags.get(tagId)) || []
    );
    return tags.filter((tag) => tag !== undefined);
  }) as Tag[];

  const safeLogTags = logTags || [];
  const safeQueryTags = queryTags || [];

  return (
    <Combobox value={safeLogTags} multiple>
      <div className="relative mt-1">
        <div className="flex flex-wrap">
          {safeLogTags.map((tag) => (
            <span
              key={tag?.id}
              onClick={async () => {
                //remove tag
                const newTags = safeLogTags.filter(
                  (selectedTag) => selectedTag.id !== tag.id
                );
                await updateLog(logId, { tags: newTags.map((t) => t.id) });
              }}
              className="rounded bg-blue-500 text-white p-1 m-1 text-xs select-none cursor-pointer whitespace-nowrap"
            >
              {tag?.name}
            </span>
          ))}
        </div>
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <Combobox.Input
            value={query}
            placeholder="Search tags"
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
            onChange={(event) => setQuery(event.target.value)}
          />

          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <HiChevronUpDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {safeQueryTags.length === 0 && query !== "" ? (
              /*@ts-expect-error want to use to create new tag so no value is there */
              <Combobox.Option
                onClick={async () => {
                  const newTagId = await db.tags.add({ name: query });
                  if (newTagId) {
                    await updateLog(logId, {
                      tags: [
                        ...safeLogTags.map((t) => Number(t.id)),
                        Number(newTagId),
                      ],
                    });
                    setQuery("");
                  }
                }}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 px-2 pr-4 ${
                    active ? "bg-blue-600 text-white" : "text-gray-900"
                  }`
                }
              >
                <span className={`block truncate`}>Create new tag</span>
              </Combobox.Option>
            ) : (
              safeQueryTags.map((tag) => (
                <Combobox.Option
                  key={tag.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-2 pr-4 ${
                      active ? "bg-blue-600 text-white" : "text-gray-900"
                    }`
                  }
                  onClick={async () => {
                    if (
                      tag?.id &&
                      !safeLogTags.map((t) => t.id).includes(tag.id)
                    ) {
                      await updateLog(logId, {
                        tags: [
                          ...safeLogTags.map((t) => Number(t.id)),
                          Number(tag.id),
                        ],
                      });
                      setQuery("");
                    }
                  }}
                  value={tag.id}
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {tag.name}
                    </span>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
