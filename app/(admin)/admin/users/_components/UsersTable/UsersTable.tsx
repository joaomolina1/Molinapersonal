import { UsersList } from "../useUsersList";
import { User } from "@/_models/user";
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
import { EditUserModal } from "./EditUserModal";

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
        <EditUserModal user={user} />
      </Cell>
    </Row>
  );
};

export default UsersTable;
