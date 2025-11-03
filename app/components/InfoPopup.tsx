"use client";

import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const InfoPopup = ({ content }: { content: string }) => {
  return (
    <Popover className="relative inline-block">
      {({ close }) => (
        <>
          <Popover.Button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75 flex items-center">
            <QuestionMarkCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" aria-hidden="true" />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute bottom-full left-1/2 -translate-x-1/2 z-10 mb-2 w-64 rounded-lg bg-muted/90 p-4 shadow-lg backdrop-blur-sm">
              <div className="relative">
                <button
                  onClick={() => close()}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-background/70 hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75"
                >
                  <XMarkIcon className="h-4 w-4 text-foreground" aria-hidden="true" />
                </button>
                <p className="text-sm text-foreground">
                  {content}
                </p>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default InfoPopup;