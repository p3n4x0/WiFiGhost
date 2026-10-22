"use client"
import React, { useCallback, useEffect, useState } from 'react';
import List from "@/app/ui/components/bault/list";
import FileUploadButton from "@/app/ui/components/bault/uploadButton";
import { fetchList } from '@/app/lib/data';

interface ListContainerProps {
  type: string;
}

const TITLES: Record<string, string> = {
  Wordlist: 'Wordlists',
  FakeNetworks: 'Fake networks',
};

const ListContainer: React.FC<ListContainerProps> = ({ type }) => {
  const [list, setList] = useState<string[]>([]);

  const reload = useCallback(() => {
    fetchList(setList, type);
  }, [type]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <section className="panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{TITLES[type] || type}</h2>
        <FileUploadButton type={type} onUploaded={reload} />
      </div>
      <List type={type} lists={list} onChanged={reload} />
    </section>
  );
};

export default ListContainer;
