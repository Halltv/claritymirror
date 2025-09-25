
"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, MoreHorizontal, BarChart } from "lucide-react";
import type { Client } from "@/types";

interface ClientListProps {
  initialClients: Client[];
}

export function ClientList({ initialClients }: ClientListProps) {
  
  const exportToCsv = () => {
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Empresa', 'Data de Cadastro'];
    
    const rows = initialClients.map(client => [
      client.id,
      client.name,
      client.email,
      client.phone,
      client.company,
      new Date(client.createdAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
    ].join(';'));

    const csvContent = [headers.join(';'), ...rows].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "clientes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Todos os Clientes</CardTitle>
            <CardDescription>
              A lista completa dos seus clientes cadastrados.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" className="gap-1" onClick={exportToCsv}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exportar
            </span>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="w-[60px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium text-primary">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{new Date(client.createdAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/clientes/${client.id}/diagnostico`} className="flex items-center">
                              <BarChart className="mr-2 h-4 w-4" />
                              Ver Diagnóstico
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
