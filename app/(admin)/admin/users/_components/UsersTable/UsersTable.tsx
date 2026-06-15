import { UsersList } from "../useUsersList";
import { User, useUpdateUserRoles } from "@/_models/user";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";
import Stack from "@/_design_system/Stack";
import Pagination from "@/_design_system/Pagination";
import InputCheckbox from "@/_design_system/InputCheckbox";
import { EditUserModal } from "./EditUserModal";
import { useShowToast } from "@/_design_system/Toast";

const UsersTable = ({ usersList }: { usersList: UsersList }) => {
  const { users } = usersList;

  return (
    <Stack gap="2.5rem">
      <TableWrapper>
        <Table ariaLabel="Utilizadores">
          <TableHeader>
            <Column isRowHeader>Nome</Column>
            <Column>Email</Column>
            <Column>Locais</Column>
            <Column>Admin</Column>
            <Column>Comercial</Column>
            <Column />
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <UserRow key={user.id} user={user} odd={index % 2 === 1} />
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
      <Pagination
        page={usersList.page}
        setPage={usersList.setPage}
        isLastPage={usersList.isLastPage}
      />
    </Stack>
  );
};

const UserRow = ({
  user,
  odd,
}: {
  user: User & { totalVenues?: number };
  odd: boolean;
}) => {
  const { mutateAsync: updateRoles, isPending } = useUpdateUserRoles();
  const showToast = useShowToast();

  const setRoles = async (roles: string[]) => {
    try {
      await updateRoles({ userId: user.id, roles });
      showToast({ text: "Permissões atualizadas" });
    } catch {
      showToast({ text: "Erro ao atualizar permissões" });
    }
  };

  // Roles that aren't part of the admin/comercial matrix are preserved.
  const baseRoles = user.roles.filter(
    (role) => role !== "admin" && role !== "comercial",
  );

  const toggleAdmin = (checked: boolean) =>
    // Removing admin also drops comercial (comerciais are admins).
    void setRoles(checked ? [...baseRoles, "admin"] : baseRoles);

  const toggleComercial = (checked: boolean) =>
    // Comercial implies admin access.
    void setRoles(
      checked
        ? [...baseRoles, "admin", "comercial"]
        : user.isAdmin
          ? [...baseRoles, "admin"]
          : baseRoles,
    );

  return (
    <Row odd={odd}>
      <Cell>
        <div>{user.name}</div>
      </Cell>
      <Cell>
        <div>{user.email}</div>
      </Cell>
      <Cell>
        <div>{user.totalVenues}</div>
      </Cell>
      <Cell>
        <div>
          <InputCheckbox
            checked={user.isAdmin}
            onChange={toggleAdmin}
            disabled={isPending}
            ariaLabel={`Admin: ${user.name}`}
          />
        </div>
      </Cell>
      <Cell>
        <div>
          <InputCheckbox
            checked={user.isComercial}
            onChange={toggleComercial}
            disabled={isPending}
            ariaLabel={`Comercial: ${user.name}`}
          />
        </div>
      </Cell>
      <Cell>
        <EditUserModal user={user} />
      </Cell>
    </Row>
  );
};

export default UsersTable;
