import React from "react";
import { useTranslation } from "react-i18next";
import KitchenIcon from '@mui/icons-material/Kitchen';

import MasterDetailsView from "../components/ui/MasterDetailsView";
import EquipmentListItem from "../components/equipment/EquipmentListItem";
import EquipmentForm from "../components/equipment/EquipmentForm";
import equipmentService from "../services/api/equipmentService";
import AssetBase from "../types/equipment/AssetBase";

/**
 * Equipment Management page that uses the MasterDetailsView component
 * for a consistent equipment management experience
 */
const EquipmentManagement: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MasterDetailsView<AssetBase>
      // Display props
      title={t("equipment.title") || "Equipment Management"}
      icon={<KitchenIcon />}
      // List props
      listItems={(search) => equipmentService.list(search)}
      renderListItem={(equipment, isSelected) => (
        <EquipmentListItem
          equipment={equipment}
          isSelected={isSelected}
        />
      )}
      // Details props
      idPropName="id"
      detailsPageComponent={(equipment: AssetBase | undefined, refreshList: () => Promise<void>) => (
        <EquipmentForm
          equipment={equipment}
          refreshList={refreshList}
        />
      )}
    />
  );
};

export default EquipmentManagement;