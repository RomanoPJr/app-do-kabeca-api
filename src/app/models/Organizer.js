import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Organizer extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        phone: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        status: Sequelize.ENUM(['ACTIVE', 'INACTIVE', 'TESTER']),
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async organizer => {
      if (organizer.password) {
        organizer.password_hash = await bcrypt.hash(organizer.password, 8);
      }
    });

    this.addHook('afterFind', async organizers => {
      if (organizers.length) {
        organizers.map(organizer => {
          switch (organizer.status) {
            case 'ACTIVE':
              organizer.status = 'Ativo';
              break;
            case 'INACTIVE':
              organizer.status = 'Inativo';
              break;
            case 'TESTER':
              organizer.status = 'Tester';
              break;
            default:
              break;
          }
          return null;
        });
      } else {
        switch (organizers.status) {
          case 'ACTIVE':
            organizers.status = 'Ativo';
            break;
          case 'INACTIVE':
            organizers.status = 'Inativo';
            break;
          case 'TESTER':
            organizers.status = 'Tester';
            break;
          default:
            break;
        }
      }
    });

    return this;
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default Organizer;
