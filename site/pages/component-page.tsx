import { useState } from "react"

import { CodeBlock } from "../components/code-block"
import { Command } from "../components/command"
import { Preview } from "../components/preview"
import { Code, H1, H2, H3, Inline, Lead, List, P, Steps, Table } from "../components/prose"
import { Tabs } from "../components/tabs"
import type { ComponentDoc } from "../content/docs"
import { installUrl, registryItem, REGISTRY_URL } from "../lib/registry"
import { DocsPager } from "./docs-layout"

function dependencyName(url: string) {
  return url.startsWith(REGISTRY_URL) ? url.slice(REGISTRY_URL.length + 1, -".json".length) : url
}

function Installation({ name }: { name: string }) {
  const item = registryItem(name)
  const [tab, setTab] = useState<"cli" | "manual">("cli")
  const registryDependencies = item.registryDependencies.map(dependencyName)

  return (
    <>
      <Tabs
        label="Installation"
        tabs={[
          { value: "cli", label: "CLI" },
          { value: "manual", label: "Manual" },
        ]}
        value={tab}
        onValueChange={setTab}
        className="mt-4 border-b border-gc-node-border"
      />
      {tab === "cli" ? (
        <Command run={`shadcn@latest add ${installUrl(name)}`} className="mt-4" />
      ) : (
        <Steps>
          {item.dependencies.length ? (
            <li>
              <P className="font-medium">Install the dependencies.</P>
              <Command add={item.dependencies} className="mt-3" />
            </li>
          ) : null}
          {registryDependencies.length ? (
            <li>
              <P className="font-medium">Install the registry items it uses.</P>
              <P className="mt-1 text-gc-muted">
                {registryDependencies.map((dependency, index) => (
                  <span key={dependency}>
                    {index ? ", " : null}
                    <Code>{dependency}</Code>
                  </span>
                ))}
              </P>
            </li>
          ) : null}
          {item.files.map((file) => (
            <li key={file.path}>
              <P className="font-medium">
                Copy the source into <Code>{file.target}</Code>.
              </P>
              <CodeBlock code={file.source} title={file.target} className="mt-3" maxHeight={420} />
            </li>
          ))}
          <li>
            <P className="font-medium">Update the import paths to match your project.</P>
          </li>
        </Steps>
      )}
    </>
  )
}

export function ComponentPage({ doc }: { doc: ComponentDoc }) {
  const item = registryItem(doc.name)

  return (
    <article>
      <H1>{item.title}</H1>
      <Lead className="mt-3">{item.description}</Lead>

      <Preview demo={doc.demo} code={doc.demoSource} className="mt-8" />

      <H2>Installation</H2>
      <Installation name={doc.name} />

      <H2>Usage</H2>
      <CodeBlock code={doc.usage} className="mt-4" />

      {doc.props ? (
        <>
          <H2>API</H2>
          {doc.props.map((group) => (
            <div key={group.component}>
              <H3>{group.component}</H3>
              <Table
                head={["Prop", "Type", "Default", "Description"]}
                rows={group.rows.map((prop) => [
                  <Code>{prop.name}</Code>,
                  <span className="font-mono text-[12px] text-gc-muted">{prop.type}</span>,
                  prop.default ? <Code>{prop.default}</Code> : "–",
                  <Inline text={prop.description} />,
                ])}
              />
            </div>
          ))}
        </>
      ) : null}

      {doc.keyboard ? (
        <>
          <H2>Keyboard</H2>
          <Table
            head={["Keys", "Action"]}
            rows={doc.keyboard.map((row) => [
              <span className="whitespace-nowrap">{row.keys}</span>,
              row.action,
            ])}
          />
        </>
      ) : null}

      {doc.notes ? (
        <>
          <H2>Notes</H2>
          <List>
            {doc.notes.map((note) => (
              <li key={note}>
                <Inline text={note} />
              </li>
            ))}
          </List>
        </>
      ) : null}

      <DocsPager />
    </article>
  )
}
