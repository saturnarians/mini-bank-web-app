"use client"
import React from "react";
import Head from "next/head";

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export default function Meta({ title, description, children }: Props) {
  const desc = description || "westinLand Bank — secure, modern banking for people and businesses.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      {children}
    </>
  );
}
