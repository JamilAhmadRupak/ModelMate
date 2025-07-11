'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const Dropdown = ({ 
  trigger, 
  items, 
  className,
  align = 'right' 
}) => {
  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className={cn('inline-flex items-center', className)}>
        {trigger}
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={`absolute ${alignClasses[align]} z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}>
          <div className="py-1">
            {items.map((item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    className={cn(
                      'flex w-full items-center px-4 py-2 text-sm text-gray-700',
                      active && 'bg-gray-100 text-gray-900'
                    )}
                    onClick={item.onClick}
                  >
                    {item.icon && (
                      <item.icon className="mr-3 h-4 w-4" />
                    )}
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown;