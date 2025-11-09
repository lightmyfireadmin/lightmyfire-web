'use client';

import { useState, useEffect, useRef } from 'react';

interface User {
  id: string;
  email: string;
  username: string | null;
}

interface RecipientSearchProps {
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
}

export default function RecipientSearch({ onSelectUser, selectedUser }: RecipientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search users with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setUsers([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/email-tool/search-users?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (response.ok) {
          setUsers(data.users || []);
          setShowDropdown(true);
        } else {
          console.error('Error searching users:', data.error);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    onSelectUser(null as any);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Recipient Email *
      </label>

      {selectedUser ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
          <div className="flex-1">
            <div className="font-medium text-foreground">{selectedUser.email}</div>
            {selectedUser.username && (
              <div className="text-sm text-muted-foreground">@{selectedUser.username}</div>
            )}
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email..."
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          {isSearching && (
            <div className="absolute right-3 top-3">
              <svg className="animate-spin h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {showDropdown && users.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none border-b border-border last:border-b-0"
                >
                  <div className="font-medium text-foreground">{user.email}</div>
                  {user.username && (
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {showDropdown && searchQuery.length >= 2 && users.length === 0 && !isSearching && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-4 text-sm text-muted-foreground">
              No users found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Search for a user by their email address
      </p>
    </div>
  );
}
