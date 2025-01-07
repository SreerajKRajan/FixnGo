import React from 'react'

export function Table({ children, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm" {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, ...props }) {
  return <thead className="[&_tr]:border-b" {...props}>{children}</thead>
}

export function TableBody({ children, ...props }) {
  return <tbody className="[&_tr:last-child]:border-0" {...props}>{children}</tbody>
}

export function TableRow({ children, ...props }) {
  return <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted" {...props}>{children}</tr>
}

export function TableHead({ children, ...props }) {
  return <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" {...props}>{children}</th>
}

export function TableCell({ children, ...props }) {
  return <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0" {...props}>{children}</td>
}

export function TableCaption({ children, ...props }) {
  return <caption className="mt-4 text-sm text-muted-foreground" {...props}>{children}</caption>
}

