import { Combobox, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { HiChevronUpDown } from "react-icons/hi2";

const people = [
  { id: 1, name: "Durward" },
  { id: 2, name: "Kenton" },
  { id: 3, name: "Therese" },
  { id: 4, name: "Benedict" },
  { id: 5, name: "Katelyn" },
];

export function Tags() {
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [query, setQuery] = useState("");

  const filteredPeople =
    query === ""
      ? people
      : people.filter((person) =>
          person.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <Combobox
      value={selectedPeople}
      onChange={setSelectedPeople}
      //@ts-expect-error multiple can be true
      multiple
    >
      <div className="relative mt-1">
        <div className="flex flex-wrap">
          {selectedPeople.map((p) => (
            <span
              key={p.name}
              onClick={() => {
                //remove person
                setSelectedPeople(
                  selectedPeople.filter((person) => person.id !== p.id)
                );
              }}
              className="rounded bg-blue-500 text-white p-1 m-1 text-xs select-none cursor-pointer whitespace-nowrap"
            >
              {p.name}
            </span>
          ))}
        </div>
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <Combobox.Input
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
            {filteredPeople.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredPeople.map((person) => (
                <Combobox.Option
                  key={person.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-2 pr-4 ${
                      active ? "bg-blue-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={person}
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {person.name}
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
